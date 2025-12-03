import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

test('renders title and author but not url or likes by default', () => {
  const blog = {
    title: 'Component testing is done with react-testing-library',
    author: 'Test Author',
    url: 'http://test.com',
    likes: 5,
    user: {
      username: 'testuser',
      name: 'Test User'
    }
  }

  const { container } = render(<Blog blog={blog} user={blog.user} />)

  const element = screen.getByText('Component testing is done with react-testing-library Test Author')
  expect(element).toBeDefined()

  expect(container).toHaveTextContent('Component testing is done with react-testing-library Test Author')

  const urlElement = screen.queryByText('http://test.com')
  expect(urlElement).toBeNull()

  const likesElement = screen.queryByText('likes 5')
  expect(likesElement).toBeNull()
})

test('url and likes are shown when the button is clicked', async () => {
  const blog = {
    title: 'Component testing is done with react-testing-library',
    author: 'Test Author',
    url: 'http://test.com',
    likes: 5,
    user: {
      username: 'testuser',
      name: 'Test User',
      id: '123'
    }
  }

  const mockHandler = vi.fn()

  render(
    <Blog blog={blog} updateBlog={mockHandler} user={blog.user} />
  )

  const user = userEvent.setup()
  const button = screen.getByText('view')
  await user.click(button)

  const urlElement = screen.getByText('http://test.com')
  expect(urlElement).toBeDefined()

  const likesElement = screen.getByText('likes 5', { exact: false })
  expect(likesElement).toBeDefined()
})

test('clicking the like button twice calls event handler twice', async () => {
  const blog = {
    title: 'Component testing is done with react-testing-library',
    author: 'Test Author',
    url: 'http://test.com',
    likes: 5,
    user: {
      username: 'testuser',
      name: 'Test User',
      id: '123'
    }
  }

  const mockHandler = vi.fn()

  render(
    <Blog blog={blog} updateBlog={mockHandler} user={blog.user} />
  )

  const user = userEvent.setup()
  const viewButton = screen.getByText('view')
  await user.click(viewButton)

  const likeButton = screen.getByText('like')
  await user.click(likeButton)
  await user.click(likeButton)

  expect(mockHandler.mock.calls).toHaveLength(2)
})
