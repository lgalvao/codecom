import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import CallerList from '../CallerList.vue'
import { nextTick } from 'vue'

global.fetch = vi.fn()

describe('CallerList.vue', () => {
  let wrapper

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders close button', () => {
    wrapper = mount(CallerList, {
      props: {
        rootPath: '/project',
        methodName: 'testMethod',
        className: 'TestClass'
      }
    })
    
    const closeButton = wrapper.find('.btn-outline-secondary')
    expect(closeButton.exists()).toBe(true)
  })

  it('emits close event when close button is clicked', async () => {
    wrapper = mount(CallerList, {
      props: {
        rootPath: '/project',
        methodName: 'testMethod',
        className: 'TestClass'
      }
    })
    
    await wrapper.find('.btn-outline-secondary').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('displays loading state while fetching callers', async () => {
    global.fetch.mockImplementation(() => new Promise(() => {})) // Never resolves

    wrapper = mount(CallerList, {
      props: {
        rootPath: '/project',
        methodName: 'testMethod',
        className: 'TestClass'
      }
    })

    await nextTick()
    expect(wrapper.find('.spinner-border').exists()).toBe(true)
    expect(wrapper.text()).toContain('Analyzing call graph...')
  })

  it('displays error state when fetch fails', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Failed to fetch'))

    wrapper = mount(CallerList, {
      props: {
        rootPath: '/project',
        methodName: 'testMethod',
        className: 'TestClass'
      }
    })

    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))
    await nextTick()
    
    expect(wrapper.find('.alert-warning').exists()).toBe(true)
    expect(wrapper.text()).toContain('Failed to fetch')
  })

  it('displays statistics when callers are loaded', async () => {
    const mockStatistics = {
      targetMethod: 'testMethod',
      targetClass: 'TestClass',
      totalCallers: 3,
      totalCallSites: 5,
      callers: [
        {
          methodName: 'caller1',
          className: 'CallerClass1',
          filePath: '/path/caller1.java',
          line: 50,
          callCount: 2
        }
      ]
    }

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStatistics
    })

    wrapper = mount(CallerList, {
      props: {
        rootPath: '/project',
        methodName: 'testMethod',
        className: 'TestClass'
      }
    })

    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))
    await nextTick()

    expect(wrapper.text()).toContain('testMethod')
    expect(wrapper.text()).toContain('TestClass')
    expect(wrapper.text()).toContain('3')
    expect(wrapper.text()).toContain('5')
  })

  it('displays "no callers found" message when callers array is empty', async () => {
    const mockStatistics = {
      targetMethod: 'testMethod',
      targetClass: 'TestClass',
      totalCallers: 0,
      totalCallSites: 0,
      callers: []
    }

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStatistics
    })

    wrapper = mount(CallerList, {
      props: {
        rootPath: '/project',
        methodName: 'testMethod',
        className: 'TestClass'
      }
    })

    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))
    await nextTick()

    expect(wrapper.text()).toContain('No callers found')
  })

  it('renders caller list items', async () => {
    const mockStatistics = {
      targetMethod: 'testMethod',
      targetClass: 'TestClass',
      totalCallers: 2,
      totalCallSites: 3,
      callers: [
        {
          methodName: 'caller1',
          className: 'CallerClass1',
          filePath: '/path/caller1.java',
          line: 50,
          callCount: 2
        },
        {
          methodName: 'caller2',
          className: 'CallerClass2',
          filePath: '/path/caller2.java',
          line: 60,
          callCount: 1
        }
      ]
    }

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStatistics
    })

    wrapper = mount(CallerList, {
      props: {
        rootPath: '/project',
        methodName: 'testMethod',
        className: 'TestClass'
      }
    })

    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))
    await nextTick()

    const callerItems = wrapper.findAll('.caller-item')
    expect(callerItems).toHaveLength(2)
    expect(wrapper.text()).toContain('caller1')
    expect(wrapper.text()).toContain('caller2')
  })

  it('emits navigate event when caller item is clicked', async () => {
    const mockStatistics = {
      targetMethod: 'testMethod',
      targetClass: 'TestClass',
      totalCallers: 1,
      totalCallSites: 1,
      callers: [
        {
          methodName: 'caller1',
          className: 'CallerClass1',
          filePath: '/path/caller1.java',
          line: 50,
          callCount: 1
        }
      ]
    }

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStatistics
    })

    wrapper = mount(CallerList, {
      props: {
        rootPath: '/project',
        methodName: 'testMethod',
        className: 'TestClass'
      }
    })

    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))
    await nextTick()

    await wrapper.find('.caller-item').trigger('click')
    expect(wrapper.emitted('navigate')).toBeTruthy()
    expect(wrapper.emitted('navigate')[0][0]).toEqual({
      filePath: '/path/caller1.java',
      line: 50
    })
  })

  it('displays call count badge with correct pluralization', async () => {
    const mockStatistics = {
      targetMethod: 'testMethod',
      targetClass: 'TestClass',
      totalCallers: 2,
      totalCallSites: 3,
      callers: [
        {
          methodName: 'caller1',
          className: 'CallerClass1',
          filePath: '/path/caller1.java',
          line: 50,
          callCount: 2
        },
        {
          methodName: 'caller2',
          className: 'CallerClass2',
          filePath: '/path/caller2.java',
          line: 60,
          callCount: 1
        }
      ]
    }

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStatistics
    })

    wrapper = mount(CallerList, {
      props: {
        rootPath: '/project',
        methodName: 'testMethod',
        className: 'TestClass'
      }
    })

    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))
    await nextTick()

    const badges = wrapper.findAll('.badge')
    expect(badges[0].text()).toBe('2 calls')
    expect(badges[1].text()).toBe('1 call')
  })

  it('reloads callers when props change', async () => {
    const mockStatistics1 = {
      targetMethod: 'testMethod1',
      targetClass: 'TestClass',
      totalCallers: 1,
      totalCallSites: 1,
      callers: []
    }

    const mockStatistics2 = {
      targetMethod: 'testMethod2',
      targetClass: 'TestClass',
      totalCallers: 2,
      totalCallSites: 2,
      callers: []
    }

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStatistics1
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStatistics2
    })

    wrapper = mount(CallerList, {
      props: {
        rootPath: '/project',
        methodName: 'testMethod1',
        className: 'TestClass'
      }
    })

    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))
    await nextTick()

    await wrapper.setProps({ methodName: 'testMethod2' })
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))
    await nextTick()

    expect(global.fetch).toHaveBeenCalledTimes(2)
  })
})
