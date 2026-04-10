Component({
  properties: {
    currentTabBar: {
      type: String,
      value: 'home',
    },
  },
  data: {
    tabbars: [
      { value: 'home', icon: 'home', ariaLabel: '我的' },
      { value: 'category', icon: 'bulletpoint', ariaLabel: '分类' },
    ],
    searchValue: '',
  },
  methods: {
    handleTabClick(e: any) {
      this.setData({
        currentTabBar: e.detail.value,
      })
      wx.navigateTo({
        url: `/pages/${e.detail.value}/index`,
      })
    },

    handleSearchChange(e: any) {
      this.setData({
        searchValue: e.detail.value,
      })
    },

    handleSearchSubmit(e: any) {
      const keyword = e.detail.value || this.data.searchValue
      this.triggerEvent('search', { keyword })
    },
  },
})
