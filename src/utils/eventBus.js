// eventBus.js
import mitt from 'mitt';

// 创建一个 mitt 实例
const eventBus = mitt();

// 将 eventBus 挂载到 window 全局对象
window.eventBus = eventBus;
export default eventBus;