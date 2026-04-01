/**
 * SafeMessenger - 可靠的跨页面通信封装 (支持多监听与解除监听)
 */
class SafeMessenger {
    constructor(config = {}) {
        this.targetWindow = config.targetWindow;
        this.targetOrigin = config.targetOrigin || '*';
        this.ackTimeout = config.ackTimeout || 500;
        this.maxRetries = config.maxRetries || 1;
        
        this.pendingMessages = new Map(); 
        this.listeners = new Map();       // 改为存储 Set，以便一个 token 对应多个 callback
        this.processedIds = new Set();    

        this._init();
    }

    _init() {
        window.addEventListener('message', (event) => {
            if (this.targetOrigin !== '*' && event.origin !== this.targetOrigin) return;
            const data = event.data;
            if (!data || typeof data !== 'object') return;

            const { type, id, token, msg } = data;

            if (type === 'ACK') {
                this._handleAck(id);
            } else if (type === 'DATA') {
                this._handleData(id, token, msg, event);
            }
        });
    }

    _handleAck(id) {
        if (this.pendingMessages.has(id)) {
            const task = this.pendingMessages.get(id);
            clearTimeout(task.timer);
            this.pendingMessages.delete(id);
            if (task.successCallback) task.successCallback({ id, status: 'delivered' });
        }
    }

    _handleData(id, token, msg, event) {
        // 1. 立即回复 ACK
        event.source.postMessage({ type: 'ACK', id }, event.origin);

        // 2. 幂等性处理
        if (this.processedIds.has(id)) return;
        this.processedIds.add(id);
        if (this.processedIds.size > 1000) {
            const firstIt = this.processedIds.values().next().value;
            this.processedIds.delete(firstIt);
        }

        // 3. 触发该 token 下的所有监听器
        if (this.listeners.has(token)) {
            const callbacks = this.listeners.get(token);
            callbacks.forEach(callback => {
                try {
                    callback(msg);
                } catch (e) {
                    console.error(`SafeMessenger: 执行 Token [${token}] 的回调时出错`, e);
                }
            });
        }
    }

    /**
     * 注册监听器
     * @param {string} token 消息标识
     * @param {Function} callback 
     */
    on(token, callback) {
        if (!this.listeners.has(token)) {
            this.listeners.set(token, new Set());
        }
        this.listeners.get(token).add(callback);
    }

    /**
     * 解除监听器
     * @param {string} token 消息标识
     * @param {Function} [callback] 可选。如果不传，则移除该 token 下的所有监听器
     */
    off(token, callback) {
        if (!this.listeners.has(token)) return;

        if (callback) {
            // 移除特定回调
            const callbacks = this.listeners.get(token);
            callbacks.delete(callback);
            if (callbacks.size === 0) {
                this.listeners.delete(token);
            }
        } else {
            // 移除该 token 下的所有回调
            this.listeners.delete(token);
        }
    }

    /**
     * 发送可靠消息
     */
    send(token, msg, successCallback = null, failCallback = null) {
        if (!this.targetWindow) {
            console.error('SafeMessenger: 未指定目标窗口');
            return;
        }

        const msgId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        const messageTask = {
            token, msg,
            attempts: 0,
            successCallback, failCallback,
            timer: null
        };

        this.pendingMessages.set(msgId, messageTask);
        this._doSend(msgId);
    }

    _doSend(id) {
        const task = this.pendingMessages.get(id);
        if (!task) return;

        if (task.attempts >= this.maxRetries) {
            if (task.failCallback) task.failCallback({ id, error: 'Max retries reached' });
            this.pendingMessages.delete(id);
            return;
        }

        task.attempts++;
        this.targetWindow.postMessage({ type: 'DATA', id, token: task.token, msg: task.msg }, this.targetOrigin);

        task.timer = setTimeout(() => {
            if (this.pendingMessages.has(id)) {
                this._doSend(id);
            }
        }, this.ackTimeout);
    }
}