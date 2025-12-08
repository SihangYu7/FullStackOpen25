import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Routes, Route, Link, useMatch } from 'react-router-dom'
import Blog from './components/Blog'
import LoginForm from './components/LoginForm'
import BlogForm from './components/BlogForm'
import Togglable from './components/Togglable'
import Notification from './components/Notification'
import Users from './components/Users'
import User from './components/User'
import { showNotification } from './reducers/notificationReducer'
import { initializeBlogs, createBlog, likeBlog, deleteBlog } from './reducers/blogReducer'
import { loginUser, logoutUser, initializeUser } from './reducers/userReducer'
import usersService from './services/users'

const App = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [users, setUsers] = useState([])

  const dispatch = useDispatch()
  const blogs = useSelector(state => state.blogs)
  const user = useSelector(state => state.user)
  const blogFormRef = useRef()

  useEffect(() => {
    dispatch(initializeBlogs())
  }, [dispatch])

  useEffect(() => {
    dispatch(initializeUser())
  }, [dispatch])

  useEffect(() => {
    usersService.getAll().then(users => {
      setUsers(users)
    })
  }, [])

  const handleLogin = (event) => {
    event.preventDefault()

    try {
      dispatch(loginUser({ username, password }))
      setUsername('')
      setPassword('')
    } catch {
      dispatch(showNotification('wrong username or password', 'error', 5))
    }
  }

  const handleLogout = () => {
    dispatch(logoutUser())
  }

  const addBlog = (blogObject) => {
    blogFormRef.current.toggleVisibility()
    try {
      dispatch(createBlog(blogObject))
      dispatch(showNotification(
        `a new blog ${blogObject.title} by ${blogObject.author} added`,
        'success',
        5
      ))
    } catch {
      dispatch(showNotification('failed to add blog', 'error', 5))
    }
  }

  const updateBlog = (id, blogObject) => {
    try {
      dispatch(likeBlog(id, blogObject))
    } catch {
      dispatch(showNotification('failed to update blog', 'error', 5))
    }
  }

  const removeBlog = (id) => {
    try {
      dispatch(deleteBlog(id))
    } catch {
      dispatch(showNotification('failed to delete blog', 'error', 5))
    }
  }

  const matchUser = useMatch('/users/:id')
  const selectedUser = matchUser
    ? users.find(u => u.id === matchUser.params.id)
    : null

  if (user === null) {
    return (
      <div>
        <Notification />
        <LoginForm
          username={username}
          password={password}
          handleUsernameChange={({ target }) => setUsername(target.value)}
          handlePasswordChange={({ target }) => setPassword(target.value)}
          handleSubmit={handleLogin}
        />
      </div>
    )
  }

  const sortedBlogs = [...blogs].sort((a, b) => b.likes - a.likes)

  const padding = { padding: 5 }

  return (
    <div>
      <div>
        <Link style={padding} to="/">blogs</Link>
        <Link style={padding} to="/users">users</Link>
        <span style={padding}>
          {user.name} logged in
          <button onClick={handleLogout}>logout</button>
        </span>
      </div>

      <Notification />

      <h2>blog app</h2>

      <Routes>
        <Route path="/users/:id" element={<User user={selectedUser} />} />
        <Route path="/users" element={<Users users={users} />} />
        <Route path="/" element={
          <div>
            <Togglable buttonLabel='create new blog' ref={blogFormRef}>
              <BlogForm createBlog={addBlog} />
            </Togglable>

            {sortedBlogs.map(blog =>
              <Blog
                key={blog.id}
                blog={blog}
                updateBlog={updateBlog}
                deleteBlog={removeBlog}
                user={user}
              />
            )}
          </div>
        } />
      </Routes>
    </div>
  )
}

export default App
