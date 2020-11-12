class Observer {
    constructor (data) {
        this.oberve(data)
    }
    oberve (data) {
        // 将原有属性改成set get形式
        if (!data || typeof data !== 'object') {
            return
        }
        // 将数据一一劫持
        Object.keys(data).forEach(key => {
            // 劫持 
            this.defineReactive(data, key, data[key])
            this.oberve(data[key])
        })
    }
    defineReactive (obj, key, value) {
        let that = this
        let dep = new Dep()
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get () {
                Dep.target && dep.addSub(Dep.target)
                return value
            },
            set (newValue) {
                if (newValue !== value) {
                    that.oberve(newValue)
                    value = newValue
                    dep.notify()
                }
            }
        })
    }
}

class Dep {
    constructor () {
        this.subs = []
    }
    addSub (watcher) {
        this.subs.push(watcher)
    }
    notify () {
        this.subs.forEach(watch => {
            watch.update()
        })
    }
}