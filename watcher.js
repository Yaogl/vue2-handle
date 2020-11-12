class Watcher {
    constructor (vm, expr, cb) {
        this.vm = vm
        this.expr = expr
        this.cb = cb
        // 现获取一下老值

        this.value = this.get()
    }
    getVal (vm, expr) {
        expr = expr.trim().split('.')
        return expr.reduce((prev, next) => {
            return prev[next]
        }, vm.$data)
    }
    get () {
        Dep.target = this
        let value = this.getVal(this.vm, this.expr)
        Dep.target = null
        return value
    }
    // 对外暴露的方法
    update () {
        let newVal = this.getVal(this.vm, this.expr)
        let oldVal = this.value
        if (newVal !== oldVal) {
            this.cb(newVal)
        }
    }
}