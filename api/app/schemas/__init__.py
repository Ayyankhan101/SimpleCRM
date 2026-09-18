from marshmallow import Schema, fields, pre_load, validate


class OrganizationSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True, validate=validate.Length(min=1, max=200))
    slug = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    plan = fields.Str(validate=validate.OneOf(['free', 'pro', 'enterprise']))
    max_users = fields.Int()
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class UserSchema(Schema):
    id = fields.Int(dump_only=True)
    email = fields.Email(required=True)
    username = fields.Str(required=True, validate=validate.Length(min=1, max=80))
    role = fields.Str(validate=validate.OneOf(['owner', 'admin', 'member']))
    org_id = fields.Int(allow_none=True)
    is_active = fields.Bool()
    created_at = fields.DateTime(dump_only=True)


class ContactSchema(Schema):
    id = fields.Int(dump_only=True)
    first_name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    last_name = fields.Str(validate=validate.Length(max=100))
    email = fields.Str(allow_none=True)
    phone = fields.Str(allow_none=True)
    company = fields.Str(allow_none=True)
    role = fields.Str(allow_none=True)
    stage = fields.Str(validate=validate.OneOf([
        'lead', 'prospect', 'qualified', 'proposal', 'negotiation',
        'closed_won', 'closed_lost'
    ]))
    score = fields.Int()
    notes = fields.Str(allow_none=True)
    owner_id = fields.Int(dump_only=True)
    org_id = fields.Int(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

    @pre_load
    def clean_fields(self, data, **kwargs):
        if data.get('email') == '':
            data['email'] = None
        for key in ('phone', 'company', 'role', 'notes'):
            if data.get(key) == '':
                data[key] = None
        return data


class DealSchema(Schema):
    id = fields.Int(dump_only=True)
    title = fields.Str(required=True, validate=validate.Length(min=1, max=200))
    value = fields.Float(required=True)
    currency = fields.Str(validate=validate.Length(max=3))
    stage = fields.Str(validate=validate.OneOf([
        'lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'
    ]))
    probability = fields.Int(validate=validate.Range(min=0, max=100))
    expected_close_date = fields.Date(allow_none=True)
    contact_id = fields.Int(allow_none=True)
    owner_id = fields.Int(dump_only=True)
    org_id = fields.Int(dump_only=True)
    notes = fields.Str(allow_none=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class ActivitySchema(Schema):
    id = fields.Int(dump_only=True)
    type = fields.Str(required=True, validate=[validate.Length(min=1, max=50), validate.OneOf(['call', 'email', 'meeting', 'note', 'task', 'follow_up'])])
    subject = fields.Str(required=True, validate=validate.Length(min=1, max=200))
    body = fields.Str(allow_none=True)
    outcome = fields.Str(allow_none=True)
    deal_id = fields.Int(allow_none=True)
    contact_id = fields.Int(allow_none=True)
    owner_id = fields.Int(dump_only=True)
    org_id = fields.Int(dump_only=True)
    due_date = fields.Date(allow_none=True)
    completed = fields.Bool()
    created_at = fields.DateTime(dump_only=True)


class ContactDetailSchema(Schema):
    id = fields.Int(dump_only=True)
    first_name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    last_name = fields.Str(validate=validate.Length(max=100))
    email = fields.Str(allow_none=True)
    phone = fields.Str(allow_none=True)
    company = fields.Str(allow_none=True)
    role = fields.Str(allow_none=True)
    stage = fields.Str(validate=validate.OneOf([
        'lead', 'prospect', 'qualified', 'proposal', 'negotiation',
        'closed_won', 'closed_lost'
    ]))
    score = fields.Int()
    notes = fields.Str(allow_none=True)
    owner_id = fields.Int(dump_only=True)
    org_id = fields.Int(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    deals = fields.List(fields.Nested('DealSchema'))
    activities = fields.List(fields.Nested('ActivitySchema'))

    @pre_load
    def clean_fields(self, data, **kwargs):
        if data.get('email') == '':
            data['email'] = None
        return data


class TagSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    color = fields.Str(validate=validate.Length(max=7))
    org_id = fields.Int()
    created_at = fields.DateTime(dump_only=True)


class AuditLogSchema(Schema):
    id = fields.Int(dump_only=True)
    user_id = fields.Int()
    org_id = fields.Int()
    action = fields.Str()
    entity_type = fields.Str()
    entity_id = fields.Int()
    changes = fields.Str(allow_none=True)
    ip_address = fields.Str(allow_none=True)
    created_at = fields.DateTime(dump_only=True)
