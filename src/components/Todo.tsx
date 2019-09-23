import React from 'react'
import './Todo.css'

interface TodoProps {
  id: string
  name: string
  done: boolean
  onDelete?: (id: string) => void
  onChange?: (id: string) => void
}

const Todo: React.FC<TodoProps> = ({ id, name, done, onChange = () => {}, onDelete = () => {} }) => {
  return (
    <div className="todo">
      <input className="todo__checkbox" type="checkbox" checked={done} onChange={() => onChange(id)} />
      <span className="todo__text">{name}</span>
      <button className="todo__delete" onClick={() => onDelete(id)}>
        delete
      </button>
    </div>
  )
}

export default Todo
