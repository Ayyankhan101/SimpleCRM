import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { CurrencyCircleDollar, CalendarBlank, DotsSixVertical } from '@phosphor-icons/react'
import api from '../utils/api'
import { DEAL_STAGES, getStageColor, getStageLabel, formatCurrency, formatRelativeDate } from '../lib/constants'
import { CardSkeleton } from '../components/ui/Skeleton'

const stageDotColors = {
  zinc: 'bg-carga-secondary dark:bg-carga-primary',
  sky: 'bg-sky-500',
  amber: 'bg-amber-500',
  orange: 'bg-orange-500',
  emerald: 'bg-carga-tertiary dark:bg-carga-secondary',
  red: 'bg-red-500',
}

function DealCard({ deal, contactName, overlay = false }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: deal.id,
    data: { deal },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        bg-carga-surface dark:bg-carga-surface-dark border border-carga-secondary/20 dark:border-carga-primary/20
        p-4 cursor-grab active:cursor-grabbing
        ${isDragging ? 'opacity-50 shadow-carga-lg' : 'shadow-carga hover:shadow-carga-lg'}
        ${overlay ? 'shadow-carga-lg rotate-2' : ''}
        transition-shadow duration-200
      `}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-medium text-carga-secondary dark:text-carga-primary leading-tight">{deal.title}</h4>
        <DotsSixVertical size={14} className="text-carga-secondary/30 dark:text-carga-primary/30 flex-shrink-0 mt-0.5" />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-bold font-mono text-carga-secondary dark:text-carga-primary">
          {formatCurrency(deal.value)}
        </span>
        {contactName && (
          <span className="text-xs text-carga-secondary/50 dark:text-carga-primary/50 truncate max-w-[120px]">
            {contactName}
          </span>
        )}
      </div>

      {deal.expected_close_date && (
        <div className="flex items-center gap-1 mt-2 text-xs text-carga-secondary/50 dark:text-carga-primary/50">
          <CalendarBlank size={12} />
          {formatRelativeDate(deal.expected_close_date)}
        </div>
      )}
    </div>
  )
}

function DealCardOverlay({ deal, contactName }) {
  return (
    <div className="w-[280px]">
      <DealCard deal={deal} contactName={contactName} overlay />
    </div>
  )
}

function ColumnContainer({ stage, deals, contactMap }) {
  const color = getStageColor(DEAL_STAGES, stage)
  const dotColor = stageDotColors[color] || 'bg-carga-secondary dark:bg-carga-primary'
  const totalValue = deals.reduce((sum, d) => sum + (d.value || 0), 0)
  const dealIds = deals.map((d) => d.id)

  const { setNodeRef, isOver } = useDroppable({ id: stage })

  return (
    <div className="flex flex-col min-w-[280px] max-w-[320px] w-full">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 ${dotColor}`} />
          <h3 className="text-sm font-display font-semibold text-carga-secondary dark:text-carga-primary">
            {getStageLabel(DEAL_STAGES, stage)}
          </h3>
          <span className="text-xs text-carga-secondary/50 dark:text-carga-primary/50 bg-carga-primary/10 dark:bg-carga-secondary/10 px-2 py-0.5 rounded-full">
            {deals.length}
          </span>
        </div>
        {totalValue > 0 && (
          <span className="text-xs font-mono text-carga-secondary/70 dark:text-carga-primary/70">
            {formatCurrency(totalValue)}
          </span>
        )}
      </div>

      {/* Cards area — droppable container */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 space-y-2 min-h-[120px] p-2 transition-colors duration-150
          border border-dashed
          ${isOver
            ? 'bg-carga-tertiary/10 dark:bg-carga-secondary/10 border-carga-tertiary dark:border-carga-secondary'
            : 'bg-carga-primary/5 dark:bg-carga-secondary/5 border-carga-secondary/20 dark:border-carga-primary/20'
          }
        `}
      >
        <SortableContext items={dealIds} strategy={verticalListSortingStrategy}>
          {deals.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-xs text-carga-secondary/40 dark:text-carga-primary/40">
              {isOver ? 'Drop here' : 'No deals'}
            </div>
          ) : (
            deals.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                contactName={contactMap[deal.contact_id]}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  )
}

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
}

const item = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
}

export default function Pipeline() {
  const [deals, setDeals] = useState([])
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [dealsRes, contactsRes] = await Promise.all([
        api.get('/v1/deals'),
        api.get('/v1/contacts'),
      ])
      setDeals(dealsRes.data || [])
      setContacts(contactsRes.data || [])
    } catch (err) {
      console.error('Pipeline fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const contactMap = {}
  contacts.forEach((c) => {
    contactMap[c.id] = `${c.first_name} ${c.last_name}`
  })

  const stageColumns = DEAL_STAGES.filter((s) => !['closed_won', 'closed_lost'].includes(s.value))
  const closedColumns = DEAL_STAGES.filter((s) => ['closed_won', 'closed_lost'].includes(s.value))
  const validStages = DEAL_STAGES.map((s) => s.value)

  const getDealsForStage = (stage) =>
    deals.filter((d) => d.stage === stage)

  const activeDeal = deals.find((d) => d.id === activeId)

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeDeal = deals.find((d) => d.id === active.id)
    if (!activeDeal) return

    let targetStage = null

    if (validStages.includes(String(over.id))) {
      targetStage = String(over.id)
    } else {
      const overDeal = deals.find((d) => d.id === over.id)
      if (overDeal) {
        targetStage = overDeal.stage
      }
    }

    if (!targetStage) return
    if (targetStage === activeDeal.stage) return

    setDeals((prev) =>
      prev.map((d) => (d.id === active.id ? { ...d, stage: targetStage } : d))
    )

    try {
      await api.put(`/v1/deals/${active.id}`, { stage: targetStage })
    } catch {
      fetchData()
    }
  }

  if (loading) return <CardSkeleton count={6} />

  return (
    <motion.div variants={container} initial="hidden" animate="visible">
      <motion.div variants={item} className="mb-6">
        <h1 className="text-2xl font-display font-bold text-carga-secondary dark:text-carga-primary tracking-tight">Pipeline</h1>
        <p className="text-sm text-carga-secondary/50 dark:text-carga-primary/50 mt-1">Drag deals between stages</p>
      </motion.div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <motion.div variants={item}>
          {/* Active pipeline stages */}
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
            {stageColumns.map((stage) => (
              <ColumnContainer
                key={stage.value}
                stage={stage.value}
                deals={getDealsForStage(stage.value)}
                contactMap={contactMap}
              />
            ))}
          </div>

          {/* Closed stages */}
          <div className="mt-6 pt-6 border-t border-carga-secondary/10 dark:border-carga-primary/10">
            <h2 className="text-xs font-semibold text-carga-secondary/40 dark:text-carga-primary/40 uppercase tracking-wider mb-3 px-1">Closed</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
              {closedColumns.map((stage) => (
                <ColumnContainer
                  key={stage.value}
                  stage={stage.value}
                  deals={getDealsForStage(stage.value)}
                  contactMap={contactMap}
                />
              ))}
            </div>
          </div>
        </motion.div>

        <DragOverlay>
          {activeDeal ? (
            <DealCardOverlay
              deal={activeDeal}
              contactName={contactMap[activeDeal.contact_id]}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </motion.div>
  )
}
