export interface Item {
  id: string
  name: string
  type: string
  image: string
  createdAt: number
}

const STORAGE_KEY = 'minimalist_items'

export class ItemManager {
  static getItems(): Item[] {
    try {
      const items = wx.getStorageSync(STORAGE_KEY)
      return items || []
    } catch (e) {
      console.error('获取物品列表失败:', e)
      return []
    }
  }

  static addItem(item: Omit<Item, 'id' | 'createdAt'>): Item {
    const items = this.getItems()
    const newItem: Item = {
      ...item,
      id: this.generateId(),
      createdAt: Date.now(),
    }
    items.unshift(newItem)
    this.saveItems(items)
    return newItem
  }

  static updateItem(id: string, updates: Partial<Omit<Item, 'id' | 'createdAt'>>): Item | null {
    const items = this.getItems()
    const index = items.findIndex(item => item.id === id)
    if (index === -1) return null

    items[index] = { ...items[index], ...updates }
    this.saveItems(items)
    return items[index]
  }

  static deleteItem(id: string): boolean {
    const items = this.getItems()
    const filteredItems = items.filter(item => item.id !== id)
    if (filteredItems.length === items.length) return false

    this.saveItems(filteredItems)
    return true
  }

  static searchItems(keyword: string): Item[] {
    const items = this.getItems()
    if (!keyword.trim()) return items

    return items.filter(item =>
      item.name.toLowerCase().includes(keyword.toLowerCase())
    )
  }

  static getItemsByType(type: string): Item[] {
    const items = this.getItems()
    if (type === 'all') return items

    return items.filter(item => item.type === type)
  }

  private static saveItems(items: Item[]): void {
    try {
      wx.setStorageSync(STORAGE_KEY, items)
    } catch (e) {
      console.error('保存物品列表失败:', e)
    }
  }

  private static generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}
