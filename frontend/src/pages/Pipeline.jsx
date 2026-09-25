import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { motion } from 'framer-motion'
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { DollarIcon, CalendarIcon, MenuDotsIcon } from '@solar-icons/react/linear'
import api from '../utils/api'
import { DEAL_STAGES, getStageColor, getStageLabel, formatCurrency, formatRelativeDate } from '../lib/constants'
import { CardSkeleton } from '../components/ui/Skeleton'
import { useToast } from '../components/ui/Toast'

const stageDotColors = {
  '#64748b': 'bg-slate-500',
  '#123029': 'bg-glassfin-secondary dark:bg-glassfin-neutral',
  '#E0714A': 'bg-glassfin-primary',
  '#2F9078': 'bg-glassfin-tertiary',
  '#ef4444': 'bg-red-500',
}

const stageDotGlows = {
  '#64748b': 'shadow-[0_0_6px_rgba(100,116,139,0.4)]',
  '#123029': 'shadow-[0_0_6px_rgba(18,48,41,0.3)]',
  '#E0714A': 'shadow-[0_0_6px_rgba(224,113,74,0.4)]',
  '#2F9078': 'shadow-[0_0_6px_rgba(47,144,120,0.4)]',
  '#ef4444': 'shadow-[0_0_6px_rgba(239,68,68,0.4)]',
}

const DealCard = memo(function DealCard({ deal, contactName, overlay = false }) {
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
        glass p-4 cursor-grab active:cursor-grabbing
        ${isDragging ? 'opacity-50 shadow-glass-lg' : 'shadow-glass hover:shadow-glass-lg'}
        ${overlay ? 'shadow-glass-lg rotate-2' : ''}
        transition-shadow duration-200
      `}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-medium font-display text-glassfin-secondary dark:text-glassfin-neutral leading-tight">{deal.title}</h4>
        <MenuDotsIcon size={14} className="text-glassfin-secondary/30 dark:text-glassfin-neutral/30 flex-shrink-0 mt-0.5" />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-bold font-mono text-glassfin-secondary dark:text-glassfin-neutral">
          {formatCurrency(deal.value)}
        </span>
        {contactName && (
          <span className="text-xs text-glassfin-secondary/70 dark:text-glassfin-neutral/70 truncate max-w-[120px]">
            {contactName}
          </span>
        )}
      </div>

      {deal.expected_close_date && (
        <div className="flex items-center gap-1 mt-2 text-xs text-glassfin-secondary/50 dark:text-glassfin-neutral/50">
          <CalendarIcon size={12} />
          {formatRelativeDate(deal.expected_close_date)}
        </div>
      )}
    </div>
  )
})

function DealCardOverlay({ deal, contactName }) {
  return (
    <div className="w-[280px]">
      <DealCard deal={deal} contactName={contactName} overlay />
    </div>
  )
}

const ColumnContainer = memo(function ColumnContainer({ stage, deals, contactMap }) {
  const color = getStageColor(DEAL_STAGES, stage)
  const dotColor = stageDotColors[color] || 'bg-glassfin-secondary dark:bg-glassfin-neutral'
  const dotGlow = stageDotGlows[color] || ''
  const totalValue = deals.reduce((sum, d) => sum + (d.value || 0), 0)
  const dealIds = deals.map((d) => d.id)

  const { setNodeRef, isOver } = useDroppable({ id: stage })

  return (
    <div className="flex flex-col min-w-[280px] max-w-[320px] w-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 ${dotColor} rounded-full ${dotGlow}`} />
          <h3 className="text-sm font-display font-semibold text-glassfin-secondary dark:text-glassfin-neutral">
            {getStageLabel(DEAL_STAGES, stage)}
          </h3>
          <span className="text-xs text-glassfin-secondary/70 dark:text-glassfin-neutral/70 bg-glassfin-primary/10 dark:bg-glassfin-primary/15 px-2 py-0.5 rounded-full">
            {deals.length}
          </span>
        </div>
        {totalValue > 0 && (
          <span className="text-xs font-mono text-glassfin-secondary/70 dark:text-glassfin-neutral/70">
            {formatCurrency(totalValue)}
          </span>
        )}
      </div>

      <div
        ref={setNodeRef}
        className={`
          flex-1 space-y-2 min-h-[120px] p-2 transition-colors duration-150
          border border-dashed rounded-xl
          ${isOver
            ? 'bg-glassfin-tertiary/10 dark:bg-glassfin-tertiary/15 border-glassfin-tertiary dark:border-glassfin-tertiary'
            : 'bg-glassfin-primary/3 dark:bg-glassfin-primary/5 border-glassfin-secondary/15 dark:border-glassfin-neutral/12'
          }
        `}
      >
        <SortableContext items={dealIds} strategy={verticalListSortingStrategy}>
          {deals.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-24 text-xs text-glassfin-secondary/50 dark:text-glassfin-neutral/50 gap-1">
              <DollarIcon size={18} className="opacity-40" />
              <span>{isOver ? 'Drop here' : 'No deals'}</span>
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
})

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
}

const item = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
}

export default function Pipeline() {
  const { toast } = useToast()
  const [pipeline, setPipeline] = useState({})
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
      const [pipelineRes, contactsRes] = await Promise.all([
        api.get('/v1/deals/pipeline'),
        api.get('/v1/contacts/', { params: { per_page: 9999 } }),
      ])
      setPipeline(pipelineRes.data.pipeline || {})
      setDeals(Object.values(pipelineRes.data.pipeline || {}).flat())
      setContacts(contactsRes.data.items || contactsRes.data || [])
    } catch (err) {
      console.error('Pipeline fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const contactMap = useMemo(() => {
    const map = {}
    contacts.forEach((c) => {
      map[c.id] = `${c.first_name} ${c.last_name}`
    })
    return map
  }, [contacts])

  const stageColumns = useMemo(() => DEAL_STAGES.filter((s) => !['closed_won', 'closed_lost'].includes(s.value)), [])
  const closedColumns = useMemo(() => DEAL_STAGES.filter((s) => ['closed_won', 'closed_lost'].includes(s.value)), [])
  const validStages = useMemo(() => DEAL_STAGES.map((s) => s.value), [])

  const getDealsForStage = useCallback((stage) =>
    pipeline[stage] || [], [pipeline])

  const activeDeal = useMemo(() => deals.find((d) => d.id === activeId), [deals, activeId])

  const handleDragStart = useCallback((event) => {
    setActiveId(event.active.id)
  }, [])

  const handleDragEnd = useCallback(async (event) => {
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
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update deal stage')
      fetchData()
    }
  }, [deals, validStages, toast])

  if (loading) return <CardSkeleton count={6} />

  return (
    <motion.div variants={container} initial="hidden" animate="visible">
      <motion.div variants={item} className="mb-6">
        <h1 className="text-2xl font-display font-bold text-glassfin-secondary dark:text-glassfin-neutral tracking-tight">Pipeline</h1>
        <p className="text-sm text-glassfin-secondary/50 dark:text-glassfin-neutral/50 mt-1">Drag deals between stages</p>
      </motion.div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <motion.div variants={item}>
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

          <div className="mt-6 pt-6 border-t border-glassfin-secondary/10 dark:border-glassfin-neutral/10">
            <h2 className="text-xs font-semibold font-display text-glassfin-secondary/60 dark:text-glassfin-neutral/60 uppercase tracking-wider mb-3 px-1">Closed</h2>
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
