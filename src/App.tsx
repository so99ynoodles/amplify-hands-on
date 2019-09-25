import React, { useState, useEffect } from 'react'
import Amplify, { API, graphqlOperation } from 'aws-amplify'
import config from './aws-exports'
import { CreateTodoInput, DeleteTodoInput, UpdateTodoInput, CreateTodoMutation, OnCreateTodoSubscription } from './API'
import { listTodos } from './graphql/queries'
import { createTodo, deleteTodo, updateTodo } from './graphql/mutations'
import { motion } from 'framer-motion'
import Todo from './components/Todo'
import { onCreateTodo, onUpdateTodo, onDeleteTodo } from './graphql/subscriptions'

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

type TodoListResponse = {
  data?: { listTodos: { items: Todo[] } }
  error?: string
}

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([])
  const [text, setText] = useState('')

  useEffect(() => {
    API.graphql(graphqlOperation(listTodos))
      .then((resp: TodoListResponse) => {
        if (resp.data) {
          setTodos(resp.data.listTodos.items)
        }
      })
      .catch((e: TodoListResponse) => console.error(e))
  }, [])

  type CreateTodoEvent = { value: { data: OnCreateTodoSubscription } }

  useEffect(() => {
    const subscription = API.graphql(graphqlOperation(onCreateTodo)).subscribe({
      next: async ({ value: { data } }: CreateTodoEvent) => {
        if (data.onCreateTodo) {
          const newTodo = {
            id: data.onCreateTodo.id,
            name: data.onCreateTodo.name,
            done: data.onCreateTodo.done
          }
          setTodos(prev => [...prev, newTodo])
        }
      }
    })

    return subscription.unsubscribe
  }, [])

  // useEffect(() => {
  //   return API.graphql(graphqlOperation(onUpdateTodo))
  // }, [])

  // useEffect(() => {
  //   return API.graphql(graphqlOperation(onDeleteTodo))
  // }, [])

  const onDelete = async (id: string) => {
    const input: DeleteTodoInput = {
      id
    }
    try {
      const resp = await API.graphql(graphqlOperation(deleteTodo, { input }))
      const updatedTodos = todos.filter((todo: Todo) => todo.id !== resp.data.deleteTodo.id)
      setTodos(updatedTodos)
    } catch (e) {
      console.log(e)
    }
  }

  const toggleCheck = (id: string) => {
    const input: UpdateTodoInput = {
      id
    }
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
      const input: CreateTodoInput = {
        name: text,
        done: false
      }
      const resp = await API.graphql(
        graphqlOperation(createTodo, {
          input
        })
      )
      // const updatedTodos = [...todos, resp.data.createTodo]
      // setTodos(updatedTodos)
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
