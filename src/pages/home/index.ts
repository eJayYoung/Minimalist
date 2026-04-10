import { ItemManager, Item } from '../../utils/item'

interface TabItem {
  label: string
  value: string
}

interface TypeOption {
  label: string
  value: string
}

Page({
  data: {
    tabs: [
      { label: '全部', value: 'all' },
      { label: '上衣', value: 'top' },
      { label: '下装', value: 'bottom' },
      { label: '鞋子', value: 'shoes' },
      { label: '配饰', value: 'accessories' },
    ] as TabItem[],
    typeOptions: [
      { label: '上衣', value: 'top' },
      { label: '下装', value: 'bottom' },
      { label: '鞋子', value: 'shoes' },
      { label: '配饰', value: 'accessories' },
    ] as TypeOption[],
    currentTab: 'all',
    items: [] as Item[],
    filteredItems: [] as Item[],
    isRefreshing: false,
    showAddDialog: false,
    newItem: {
      name: '',
      type: 'top',
      image: '',
    },
    tempImagePath: '',
  },

  onLoad() {
    this.loadItems()
  },

  onShow() {
    this.loadItems()
  },

  loadItems() {
    const items = ItemManager.getItems()
    const typeMap: Record<string, string> = {
      top: '上衣',
      bottom: '下装',
      shoes: '鞋子',
      accessories: '配饰',
    }

    const itemsWithTypeLabel = items.map(item => ({
      ...item,
      typeLabel: typeMap[item.type] || item.type,
    }))

    this.setData({
      items: itemsWithTypeLabel,
      filteredItems: this.filterItems(itemsWithTypeLabel, this.data.currentTab),
    })
  },

  filterItems(items: Item[], type: string) {
    if (type === 'all') return items
    return items.filter(item => item.type === type)
  },

  handleTabChange(e: any) {
    const currentTab = e.detail.value
    this.setData({
      currentTab,
      filteredItems: this.filterItems(this.data.items, currentTab),
    })
  },

  handleCameraClick() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath
        this.setData({
          tempImagePath: tempFilePath,
          showAddDialog: true,
          'newItem.image': tempFilePath,
        })
      },
    })
  },

  handleNameChange(e: any) {
    this.setData({
      'newItem.name': e.detail.value,
    })
  },

  handleTypeChange(e: any) {
    this.setData({
      'newItem.type': e.detail.value,
    })
  },

  handleAddConfirm() {
    const { name, type, image } = this.data.newItem

    if (!name.trim()) {
      wx.showToast({
        title: '请输入物品名称',
        icon: 'none',
      })
      return
    }

    if (!image) {
      wx.showToast({
        title: '请选择图片',
        icon: 'none',
      })
      return
    }

    ItemManager.addItem({
      name: name.trim(),
      type,
      image,
    })

    this.setData({
      showAddDialog: false,
      newItem: {
        name: '',
        type: 'top',
        image: '',
      },
      tempImagePath: '',
    })

    this.loadItems()

    wx.showToast({
      title: '添加成功',
      icon: 'success',
    })
  },

  handleAddCancel() {
    this.setData({
      showAddDialog: false,
      newItem: {
        name: '',
        type: 'top',
        image: '',
      },
      tempImagePath: '',
    })
  },

  handleRefresh() {
    this.setData({ isRefreshing: true })

    setTimeout(() => {
      this.loadItems()
      this.setData({ isRefreshing: false })
    }, 500)
  },

  handleItemClick(e: any) {
    const id = e.currentTarget.dataset.id
    wx.showToast({
      title: '物品详情功能待开发',
      icon: 'none',
    })
  },

  handleSearch(e: any) {
    const keyword = e.detail.keyword
    const filtered = keyword
      ? this.data.items.filter(item =>
          item.name.toLowerCase().includes(keyword.toLowerCase())
        )
      : this.data.items

    this.setData({
      filteredItems: this.filterItems(filtered, this.data.currentTab),
    })
  },
})
