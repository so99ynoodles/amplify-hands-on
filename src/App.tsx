import React, { useState, useEffect } from 'react'
import Amplify, { API, graphqlOperation } from 'aws-amplify'
import config from './aws-exports'
import { listTodos } from './graphql/queries'
import { createTodo } from './graphql/mutations'
import { motion } from 'framer-motion'
import Todo from './components/Todo'

Amplify.configure(config)

const todoList = [
  {
    id: '0',
    name: 'create-react-app amplify-hands-on',
    done: false
  },
  {
    id: '1',
    name: 'yarn global add @aws-amplify-cli',
    done: false
  },
  {
    id: '2',
    name: 'yarn add aws-amplify aws-amplify-react',
    done: true
  }
]

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([])
  const [text, setText] = useState('')

  useEffect(() => {
    API.graphql(graphqlOperation(listTodos))
      .then((resp: any) => {
        setTodos(resp.data.listTodos.items)
      })
      .catch((e: any) => console.error(e))
  }, [])

  const onDelete = (id: string) => {
    const updatedTodos = todos.filter((todo: Todo) => todo.id !== id)
    setTodos(updatedTodos)
  }

  const toggleCheck = (id: string) => {
    const updatedTodos = todos.map((todo: Todo) => {
      if (todo.id === id) {
        return {
          ...todo,
          done: !todo.done
        }
      }
      return todo
    })
    setTodos(updatedTodos)
  }

  const addTodo = async () => {
    try {
      const resp = await API.graphql(
        graphqlOperation(createTodo, {
          input: {
            name: text,
            done: false
          }
        })
      )
      const updatedTodos = [...todos, resp.data.createTodo]
      setTodos(updatedTodos)
      setText('')
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <div>
      <motion.div
        initial={{
          scale: 0,
          x: '-50%',
          y: '-50%'
        }}
        animate={{
          scale: 1
        }}
        className="main"
      >
        {(todos || []).map((todo: Todo) => (
          <Todo key={todo.id} id={todo.id} name={todo.name} done={todo.done} onDelete={onDelete} onChange={toggleCheck} />
        ))}

        <motion.div className="add">
          <motion.input
            onChange={e => {
              setText(e.target.value)
            }}
            value={text}
            className="text"
            type="text"
            placeholder="Add todos"
          />
          <motion.button disabled={text.trim() === ''} onClick={addTodo} className="button">
            Add
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default App
