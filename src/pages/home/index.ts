// 物品类型定义
interface Item {
  id: string
  name: string
  category: string
  categoryLabel: string
  imageUrl: string
  createTime: number
}

// 分类配置
const CATEGORY_MAP: Record<string, string> = {
  all: '全部',
  top: '上衣',
  bottom: '下装',
  shoes: '鞋子',
  accessories: '配饰',
}

const CATEGORY_OPTIONS = [
  { label: '上衣', value: 'top' },
  { label: '下装', value: 'bottom' },
  { label: '鞋子', value: 'shoes' },
  { label: '配饰', value: 'accessories' },
]

Page({
  data: {
    // 标签页
    tabs: [
      { label: '全部', value: 'all' },
      { label: '上衣', value: 'top' },
      { label: '下装', value: 'bottom' },
      { label: '鞋子', value: 'shoes' },
      { label: '配饰', value: 'accessories' },
    ],
    currentTab: 'all',

    // 搜索
    searchKeyword: '',

    // 物品列表
    items: [] as Item[],
    filteredItems: [] as Item[],

    // 分页加载
    isRefreshing: false,
    isLoadingMore: false,
    hasMore: true,
    pageSize: 12,
    currentPage: 1,

    // 添加物品弹窗
    showAddDialog: false,
    tempImageUrl: '',
    newItemName: '',
    newItemCategory: 'top',
    categoryOptions: CATEGORY_OPTIONS,
  },

  onLoad() {
    this.loadItems()
  },

  // 加载物品列表
  loadItems(reset = false) {
    if (reset) {
      this.setData({
        currentPage: 1,
        hasMore: true,
      })
    }

    // 从本地存储获取数据
    const items = wx.getStorageSync('items') || []

    this.setData({
      items,
    })

    this.filterItems()
  },

  // 筛选物品
  filterItems() {
    const { items, currentTab, searchKeyword } = this.data

    let filtered = items

    // 按分类筛选
    if (currentTab !== 'all') {
      filtered = filtered.filter(item => item.category === currentTab)
    }

    // 按名称搜索
    if (searchKeyword) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchKeyword.toLowerCase())
      )
    }

    // 按时间倒序
    filtered = filtered.sort((a, b) => b.createTime - a.createTime)

    this.setData({
      filteredItems: filtered,
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({ isRefreshing: true })

    setTimeout(() => {
      this.loadItems(true)
      this.setData({ isRefreshing: false })
    }, 500)
  },

  // 加载更多
  onLoadMore() {
    if (!this.data.hasMore || this.data.isLoadingMore) return

    this.setData({ isLoadingMore: true })

    // 模拟加载更多
    setTimeout(() => {
      this.setData({
        isLoadingMore: false,
        hasMore: false,
      })
    }, 500)
  },

  // 标签切换
  onTabChange(e: any) {
    this.setData({
      currentTab: e.detail.value,
    })
    this.filterItems()
  },

  // 搜索变化
  onSearchChange(e: any) {
    this.setData({
      searchKeyword: e.detail.value,
    })
    this.filterItems()
  },

  // 清空搜索
  onSearchClear() {
    this.setData({
      searchKeyword: '',
    })
    this.filterItems()
  },

  // 点击拍照按钮
  onCameraTap() {
    wx.showActionSheet({
      itemList: ['拍照', '从相册选择'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.takePhoto()
        } else {
          this.chooseFromAlbum()
        }
      },
    })
  },

  // 拍照
  takePhoto() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath
        this.showAddDialog(tempFilePath)
      },
      fail: (err) => {
        console.error('拍照失败:', err)
      },
    })
  },

  // 从相册选择
  chooseFromAlbum() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath
        this.showAddDialog(tempFilePath)
      },
      fail: (err) => {
        console.error('选择图片失败:', err)
      },
    })
  },

  // 显示添加弹窗
  showAddDialog(imageUrl: string) {
    this.setData({
      showAddDialog: true,
      tempImageUrl: imageUrl,
      newItemName: '',
      newItemCategory: 'top',
    })
  },

  // 物品名称变化
  onItemNameChange(e: any) {
    this.setData({
      newItemName: e.detail.value,
    })
  },

  // 分类变化
  onCategoryChange(e: any) {
    this.setData({
      newItemCategory: e.detail.value,
    })
  },

  // 保存物品
  onSaveItem() {
    const { newItemName, newItemCategory, tempImageUrl } = this.data

    if (!newItemName.trim()) {
      wx.showToast({
        title: '请输入物品名称',
        icon: 'none',
      })
      return
    }

    // 保存图片到本地
    const fs = wx.getFileSystemManager()
    const fileName = `item_${Date.now()}.jpg`
    const localPath = `${wx.env.USER_DATA_PATH}/${fileName}`

    fs.saveFile({
      tempFilePath: tempImageUrl,
      filePath: localPath,
      success: () => {
        // 创建新物品
        const newItem: Item = {
          id: `item_${Date.now()}`,
          name: newItemName.trim(),
          category: newItemCategory,
          categoryLabel: CATEGORY_MAP[newItemCategory],
          imageUrl: localPath,
          createTime: Date.now(),
        }

        // 保存到本地存储
        const items = wx.getStorageSync('items') || []
        items.unshift(newItem)
        wx.setStorageSync('items', items)

        // 关闭弹窗并刷新列表
        this.setData({
          showAddDialog: false,
          tempImageUrl: '',
          newItemName: '',
        })

        this.loadItems(true)

        wx.showToast({
          title: '保存成功',
          icon: 'success',
        })
      },
      fail: (err) => {
        console.error('保存图片失败:', err)
        wx.showToast({
          title: '保存失败',
          icon: 'none',
        })
      },
    })
  },

  // 取消添加
  onCancelAdd() {
    this.setData({
      showAddDialog: false,
      tempImageUrl: '',
      newItemName: '',
    })
  },
})
