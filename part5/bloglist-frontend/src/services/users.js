const baseUrl = '/api/users'

const getAll = async () => {
  const response = await fetch(baseUrl)
  if (!response.ok) {
    throw new Error('Failed to fetch users')
  }
  return await response.json()
}

export default { getAll }
