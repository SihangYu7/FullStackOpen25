const { test, expect, beforeEach, describe } = require('@playwright/test')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset')
    await request.post('/api/users', {
      data: {
        name: 'Matti Luukkainen',
        username: 'mluukkai',
        password: 'salainen'
      }
    })
    await page.goto('/')
  })

  test('Login form is shown', async ({ page }) => {
    await expect(page.getByText('Log in to application')).toBeVisible()
    await expect(page.getByRole('button', { name: 'login' })).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await page.getByLabel('username').fill('mluukkai')
      await page.getByLabel('password').fill('salainen')
      await page.getByRole('button', { name: 'login' }).click()

      await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await page.getByLabel('username').fill('mluukkai')
      await page.getByLabel('password').fill('wrong')
      await page.getByRole('button', { name: 'login' }).click()

      await expect(page.getByText('wrong username or password')).toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await page.getByLabel('username').fill('mluukkai')
      await page.getByLabel('password').fill('salainen')
      await page.getByRole('button', { name: 'login' }).click()
    })

    test('a new blog can be created', async ({ page }) => {
      await page.getByRole('button', { name: 'create new blog' }).click()
      await page.getByPlaceholder('write title here').fill('Test Blog Title')
      await page.getByPlaceholder('write author here').fill('Test Author')
      await page.getByPlaceholder('write url here').fill('http://test.com')
      await page.getByRole('button', { name: 'create' }).click()

      await expect(page.getByText('Test Blog Title Test Author')).toBeVisible()
    })

    describe('and a blog exists', () => {
      beforeEach(async ({ page }) => {
        await page.getByRole('button', { name: 'create new blog' }).click()
        await page.getByPlaceholder('write title here').fill('Test Blog Title')
        await page.getByPlaceholder('write author here').fill('Test Author')
        await page.getByPlaceholder('write url here').fill('http://test.com')
        await page.getByRole('button', { name: 'create' }).click()
        await page.getByText('Test Blog Title Test Author').waitFor()
      })

      test('blog can be liked', async ({ page }) => {
        await page.getByRole('button', { name: 'view' }).click()
        await expect(page.getByText('likes 0')).toBeVisible()

        await page.getByRole('button', { name: 'like' }).click()
        await expect(page.getByText('likes 1')).toBeVisible()
      })

      test('user who added the blog can delete it', async ({ page }) => {
        await page.getByRole('button', { name: 'view' }).click()

        page.on('dialog', dialog => dialog.accept())
        await page.getByRole('button', { name: 'remove' }).click()

        await expect(page.getByText('Test Blog Title Test Author')).not.toBeVisible()
      })

      test('only the creator sees the delete button', async ({ page, request }) => {
        await page.getByRole('button', { name: 'view' }).click()
        await expect(page.getByRole('button', { name: 'remove' })).toBeVisible()

        await page.getByRole('button', { name: 'logout' }).click()

        await request.post('/api/users', {
          data: {
            name: 'Another User',
            username: 'another',
            password: 'password'
          }
        })

        await page.getByLabel('username').fill('another')
        await page.getByLabel('password').fill('password')
        await page.getByRole('button', { name: 'login' }).click()

        await page.getByRole('button', { name: 'view' }).click()
        await expect(page.getByRole('button', { name: 'remove' })).not.toBeVisible()
      })
    })

    describe('and multiple blogs exist', () => {
      beforeEach(async ({ page }) => {
        await page.getByRole('button', { name: 'create new blog' }).click()
        await page.getByPlaceholder('write title here').fill('First Blog')
        await page.getByPlaceholder('write author here').fill('First Author')
        await page.getByPlaceholder('write url here').fill('http://first.com')
        await page.getByRole('button', { name: 'create' }).click()
        await page.getByText('First Blog First Author').waitFor()

        await page.getByRole('button', { name: 'create new blog' }).click()
        await page.getByPlaceholder('write title here').fill('Second Blog')
        await page.getByPlaceholder('write author here').fill('Second Author')
        await page.getByPlaceholder('write url here').fill('http://second.com')
        await page.getByRole('button', { name: 'create' }).click()
        await page.getByText('Second Blog Second Author').waitFor()

        await page.getByRole('button', { name: 'create new blog' }).click()
        await page.getByPlaceholder('write title here').fill('Third Blog')
        await page.getByPlaceholder('write author here').fill('Third Author')
        await page.getByPlaceholder('write url here').fill('http://third.com')
        await page.getByRole('button', { name: 'create' }).click()
        await page.getByText('Third Blog Third Author').waitFor()
      })

      test('blogs are ordered by likes', async ({ page }) => {
        const secondBlog = page.locator('.blog').filter({ hasText: 'Second Blog' })
        await secondBlog.getByRole('button', { name: 'view' }).click()
        await secondBlog.getByRole('button', { name: 'like' }).click()
        await secondBlog.getByText('likes 1').waitFor()
        await secondBlog.getByRole('button', { name: 'like' }).click()
        await secondBlog.getByText('likes 2').waitFor()

        const thirdBlog = page.locator('.blog').filter({ hasText: 'Third Blog' })
        await thirdBlog.getByRole('button', { name: 'view' }).click()
        await thirdBlog.getByRole('button', { name: 'like' }).click()
        await thirdBlog.getByText('likes 1').waitFor()

        const blogs = page.locator('.blog')
        await expect(blogs.nth(0)).toContainText('Second Blog')
        await expect(blogs.nth(1)).toContainText('Third Blog')
        await expect(blogs.nth(2)).toContainText('First Blog')
      })
    })
  })
})
