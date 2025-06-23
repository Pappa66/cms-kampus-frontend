type Props = {
  message: string
  type?: 'info' | 'error' | 'success'
}

export default function Notification({ message, type = 'info' }: Props) {
  const color =
    type === 'success'
      ? 'green'
      : type === 'error'
      ? 'red'
      : 'blue'

  return (
    <div className={`bg-${color}-100 text-${color}-700 p-3 rounded mb-4`}>
      {message}
    </div>
  )
}
