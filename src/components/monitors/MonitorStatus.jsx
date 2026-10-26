import StatusBadge from '../ui/StatusBadge'

const states = {
  active: { label: 'Active', icon: 'record-circle', variant: 'monitor-active' },
  paused: { label: 'Paused', icon: 'pause-circle', variant: 'monitor-paused' },
  archived: { label: 'Archived', icon: 'archive', variant: 'monitor-archived' },
}

export default function MonitorStatus({ status }) {
  const state = states[status] || {
    label: 'Unknown',
    icon: 'question-circle',
    variant: 'monitor-archived',
  }
  return (
    <StatusBadge variant={state.variant} icon={state.icon}>
      {state.label}
    </StatusBadge>
  )
}
