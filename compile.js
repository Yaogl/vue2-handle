class Compile {
    constructor (el, vm) {
        this.el = this.isElementNode(el) ? el : document.querySelector(el)
        this.vm = vm
        if (this.el) {
            let fragment = this.node2fragment(this.el)
            this.compile(fragment)
            this.el.appendChild(fragment)
        }
    }
    /* 辅助方法 */
    isElementNode (node) {
        return node.nodeType === 1;
    }
    isDirective (name) {
        return name.includes('v-')
    }
    /* 核心方法 */
    compileElement (node) {
        // 编译元素，检查指令 v-model
        let attrs = node.attributes
        Array.from(attrs).forEach(attr => {
            let attrName = attr.name
            if (this.isDirective(attrName)) {
                let expr = attr.value
                let [, type] = attrName.split('-')
                CompileUtil[type](node, this.vm, expr)
            }
        })
    }
    
    compileText (node) {
        // 编译元素，检查 {{  }}
        let expr = node.textContent
        let reg = /\{\{([^}]+)\}\}/g
        if (reg.test(expr)) {
            CompileUtil['text'](node, this.vm, expr)
        }
    }
    
    compile (fragment) {
        let childNodes = fragment.childNodes
        Array.from(childNodes).forEach(node => {
            if (this.isElementNode(node)) {
                // 编译元素
                // 需要继续编译，查询子元素
                this.compileElement(node)
                this.compile(node)
            } else {
                // 编译文本
                this.compileText(node)
            }
        }) 
    }
    node2fragment (el) {
        let fragment = document.createDocumentFragment()
        let firstChild;
        while (firstChild = el.firstChild) {
            fragment.appendChild(firstChild)
        }
        return fragment
    }
}

CompileUtil = {
    getVal (vm, expr) {
        expr = expr.trim().split('.')
        return expr.reduce((prev, next) => {
            return prev[next]
        }, vm.$data)
    },
    setVal (vm, expr, value) {
        expr = expr.trim().split('.')
        let val = vm.$data
        expr.forEach(function(k, i) {
            // 非最后一个key，更新val的值
            if (i < expr.length - 1) {
                val = val[k];
            } else {
                val[k] = value;
            }
        })
    },
    getTextVal (vm, expr) {
        return expr.replace(/\{\{([^}]+)\}\}/g, (...arguments) => {
            return this.getVal(vm, arguments[1])
        })
    },
    text (node, vm, expr) { // 文本处理
        let updateFn = this.updater['textUpdater']
        // message.a => [message, a]
        let value = this.getTextVal(vm, expr)

        expr.replace(/\{\{([^}]+)\}\}/g, (...arguments) => {
            new Watcher(vm, arguments[1], (newVal) => {
                updateFn && updateFn(node, this.getTextVal(vm, expr))
            })
        })

        updateFn && updateFn(node, value)
    },
    model (node, vm, expr) { // 输入处理
        let updateFn = this.updater['modelUpdater']
        // message.a => [message, a]
        new Watcher(vm, expr, (newVal) => {
            updateFn && updateFn(node, this.getVal(vm, expr))
        })

        const val = this.getVal(vm, expr)
        node.addEventListener('input', (e) => {
            var newValue = e.target.value;
            if (val === newValue) {
                return;
            }
            this.setVal(vm, expr, newValue)
        })
        updateFn && updateFn(node, this.getVal(vm, expr))
    },
    updater: {
        textUpdater (node, value) {
            node.textContent = value
        },
        modelUpdater (node, value) {
            console.log(value);
            node.value = value
        }
    }
}