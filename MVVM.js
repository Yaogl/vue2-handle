class MVVM {
    constructor (options) {
        this.$el = options.el
        this.$data = options.data
        if (this.$el) {
            // 数据劫持
            new Observer(this.$data)
            // 用数据和元素进行编辑
            new Compile(this.$el, this)
        }
    }
}