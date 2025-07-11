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
  },
})