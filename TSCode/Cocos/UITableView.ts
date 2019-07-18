class LogUtil {
    public static DEBUG = true;
    public static LOG(message?: any, ...data) {
        if (this.DEBUG) console.log(message, data);
    }
}

abstract class UITableView {

    protected NODEKEY = 'NodeKey';

    protected scrollview: cc.ScrollView;
    protected content: cc.Node;

    protected direction: ScrollDirection = ScrollDirection.Vertical;
    protected datas: Array<any> = null;
    protected allowScroll: boolean = false;

    protected node_pools_map: Map<string, cc.Node[]>;
    protected node_templates_map: Map<string, cc.Node>;

    protected nodeEstimatedHeightOrWidthCB: (tableView: UITableView, index: number, data: any) => number;
    protected nodeForIndexCB: (tableView: UITableView, index: number, data: any) => cc.Node;
    protected nodeRemoveForIndexCB?: (tableView: UITableView, index: number, item: cc.Node) => void;

    protected showNodeArr: Array<ShowNode>;
    protected showNodeCount = 0;

    protected start_index: number;
    protected stop_index: number;

    protected start_newer_index: number;
    protected stop_newer_index: number;

    protected visibleHeight = 0;
    protected visibleWidth = 0;
    protected contentLastY = 0;

    constructor(params: TableViewParams) {
        this.scrollview = params.scrollview;
        this.content = params.content;

        this.direction = params.direction;

        this.nodeEstimatedHeightOrWidthCB = params.nodeEstimatedHeightOrWidthCB;
        this.nodeForIndexCB = params.nodeForIndexCB;
        this.nodeRemoveForIndexCB = params.nodeRemoveForIndexCB;
        
        this.node_pools_map = new Map();
        this.node_templates_map = new Map();
        
        if (params.allowScroll) {
            this.allowScroll = true;
            this.scrollview.node.on("scrolling", this._on_scrolling, this);
        }

        this.refreshContentWH();
    }

    /**
     * 刷新内容宽高
     */
    refreshContentWH() {
        LogUtil.LOG("UITableView refreshContentWH");
        
        this.content.width = this.scrollview.node.width;
        this.content.height = this.scrollview.node.height;

        this.visibleHeight = this.content.height;
        this.visibleWidth = this.content.width;
    }

    /**
     * 注册缓存对象
     */
    public registerNodeTemplateOfKey(key: string, prefab: any) {
        if (this.stringIsEmpty(key)) return;
        if (this.objectIsEmpty(prefab)) return;

        this.node_templates_map[key] = prefab;
    }

    /**
     * 获取缓存对象
     */
    public obtainNodeOfKey(key: string) {
        if (this.stringIsEmpty(key)) return;

        let node: cc.Node;
        const pools: Array<cc.Node> = this.node_pools_map.get(key);
        if (pools && pools.length > 0) {
            node = pools.pop();
        } else {
            const prefab = this.node_templates_map[key];
            node = cc.instantiate(prefab);
            // node = UIUtil.parseGameUIFromJSON(prefab);
            LogUtil.LOG("UITableView obtainNodeOfKey, key = ", key);
        }
        node[this.NODEKEY] = key;

        node.active = true;
        if (!node.parent) this.content.addChild(node); //避免频繁的add remove
        return node;
    }

    /**
     * 设置数据源
     */
    public set_data(datas: any[]) {
        if (this.objectIsEmpty(datas) || datas.length < 1) {
            LogUtil.LOG("UITableView nothing to set");
            return;
        }

        LogUtil.LOG("UITableView set_data ");

        this._recycle_items();
        this.showNodeArr = new Array<ShowNode>();
        let showNode: ShowNode = null;
        datas.forEach((data, index) => {
            showNode = this._generateShowNode(data, index);
            this.showNodeArr.push(showNode);
        });
        this.showNodeCount = this.showNodeArr.length;

        this.start_index = 0;
        this.stop_index = 0;

        this.refreshContentWH();

        this.layout_items();
    }

    /**
     * 追加数据源 单个数据
     */
    public append_data(data: any) {
        if (this.showNodeCount < 1) {
            this.set_data([data]);
            return;
        }

        LogUtil.LOG("UITableView append_data ");

        const showNode: ShowNode = this._generateShowNode(data, this.showNodeCount);
        this.showNodeArr.push(showNode);
        this.showNodeCount++;

        this.layout_lastest_item();
    }

    /**
     * 预估高度
     */
    abstract estimateContentValue(): number;

    /**
     * 根据位置获取Item
     */
    abstract getItemByPos(pos: cc.Vec2): cc.Node;

    /**
     * 被动设置滑动值
     */
    abstract scrollToY(v: number): void;

    /**
     * 滑动回调函数
     */
    abstract _on_scrolling(): void;

    /**
     * 计算滑动值
     */
    abstract _calcVertical(moveY: number): void;

    /**
     * 渲染显示Items
     */
    abstract _render_items(scrollTo: ScrollTo): void;

    /**
     * 尝试回收Items
     */
    abstract _try_recycle_item(): void;

    /**
     * 回收Items
     */
    _recycle_items() {
        if (this.showNodeArr) {
            this.showNodeArr.forEach((ShowNode) => {
                this._recycle_item(ShowNode);
            });
        }
    }

    /**
     * 回收Item
     */
    _recycle_item(showNode: ShowNode) {
        if (showNode.node) {
            const nodeKey = showNode.node[this.NODEKEY];
            LogUtil.LOG('UITableView recycle_item = ', nodeKey);
            let pools: Array<cc.Node> = this.node_pools_map.get(nodeKey);
            if (pools == null) {
                pools = new Array<cc.Node>();
                this.node_pools_map.set(nodeKey, pools);
            }

            //避免频繁的add remove
            showNode.node.active = false; // showNode.node.removeFromParent();
            if (this.nodeRemoveForIndexCB) {
                this.nodeRemoveForIndexCB(this, showNode.index, showNode.node)
            }
            pools.push(showNode.node);
            showNode.node = null;
        }
    }

    private _tmpXY = 0;
    /**
     * 生成ShowNode
     */
    _generateShowNode(data: any, index: number) {
        // 先初始化Y值 和 Height 
        const showNode = { x: 0, y: 0, height: 0, width: 0, index: -1, data: data, node: null, selected: false };
        if (this.direction === ScrollDirection.Vertical) {
            const height = this.nodeEstimatedHeightOrWidthCB(this, index, showNode.data);
            showNode.y = this._tmpXY;
            showNode.height = height;
            this._tmpXY -= height;
        } else {
            const width = this.nodeEstimatedHeightOrWidthCB(this, index, showNode.data);
            showNode.x = this._tmpXY;
            showNode.width = width;
            this._tmpXY += width;
        }
        return showNode;
    }

    /**
     * 布局Items
     */
    abstract layout_items(): void;

    /**
     * 布局最新的Item
     */
    abstract layout_lastest_item(): void;

    /** 
     * 装饰ShowNode
     */
    abstract decorateShowNode(showNode: ShowNode, index: number, xy: number, TopLeft: boolean): cc.Node;

    /**
     * 销毁
     */
    public destroy() {
        this._recycle_items();
        this.node_pools_map.forEach((pools, key) => {
            pools.forEach((node) => {
                node.destroy();
            });
        });
        this.node_pools_map = null;
        this.node_templates_map.forEach(prefab => {
            prefab.destroy();
        });
        this.node_templates_map = null;
        this.showNodeArr = null;

        if (this.scrollview) {
            if (this.allowScroll) this.scrollview.node.off("scrolling", this._on_scrolling, this);
            this.scrollview = null;
            this.content = null;
        }
    }

    /**
     * 存活的节点数量
     */
    protected _alivingItemCount() {
        let count = 0;
        this.showNodeArr.forEach(showNode => {
            if (showNode.node) {
                count++;
            }
        });
        return count;
    }

    /**
     * string是否为空
     */
    private stringIsEmpty(key: string) {
        return (key === null || key === undefined || key === '');
    }

    /**
     * 对象是否为空
     */
    private objectIsEmpty(object: any) {
        return (object === null || object === undefined);
    }
}

export class UITableViewV extends UITableView {

    estimateContentValue(): number {
        if (!this.showNodeArr) return 0;
        
        let height = 0;
        this.showNodeArr.forEach((showNode, index) => {
            if (showNode.height > 0) {
                height += showNode.height;
            } else {
                height += this.nodeEstimatedHeightOrWidthCB(this, index, showNode.data);
            }
        });
        return height;
    }

    getItemByPos(pos: cc.Vec2): cc.Node {
        let retNode: cc.Node = null;
        for (let i = 0, l = this.showNodeArr.length; i < l; i++) {
            const showNode = this.showNodeArr[i];
            if (!showNode.node) {
                continue;
            }
            if (pos.y < showNode.node.y && pos.y > (showNode.node.y - showNode.height)) {
                retNode = showNode.node;
                break;
            }
        }
        return retNode;
    }

    scrollToY(v: number) {
        this.content.y = v;
        this._calcVertical(v);
    }

    _on_scrolling() {
        const contentY = this.content.y;
        this._calcVertical(contentY);
    }

    _calcVertical(moveY: number) {
        // 0 50 100
        const value = moveY - this.contentLastY;
        if (Math.abs(value) < 0.1) return;

        const scrollTo: ScrollTo = moveY - this.contentLastY > 0 ? ScrollTo.Bottom : ScrollTo.Top;
        this.contentLastY = moveY;

        let start = this.start_index;
        let stop = this.stop_index;

        //拿content中的node的y值 和 top值比较
        const viewport_start_y = -moveY;
        //拿content中的node的y值 和 bottom比较
        const viewport_stop_y = -moveY - this.visibleHeight;

        // LogUtil.LOG('UITableView on_scrolling contentY --- ', moveY);

        let showNode: ShowNode = null;

        if (scrollTo == ScrollTo.Bottom) { // 向下
            for (let i = stop; i < this.showNodeCount; i++) {
                showNode = this.showNodeArr[i];
                // LogUtil.LOG('UITableView on_scrolling Right i --- ', i, showNode.y, showNode.height);
                if (showNode.height < 1 || (showNode.y - showNode.height) < viewport_stop_y) { // -100 < -90
                    stop = i;
                    break;
                }
            }

            for (let i = stop - 1; i >= start; i--) {
                showNode = this.showNodeArr[i];
                if (showNode.y > viewport_start_y) { // -10 < -5
                    start = i;
                    break;
                }
            }
        } else { // 向上
            for (let i = start; i > -1; i--) {
                showNode = this.showNodeArr[i];
                if (showNode.y > viewport_start_y) { // start_y > 0 || -5 > -10
                    start = i;
                    break;
                }
            }
            for (let i = start + 1; i <= stop; i++) {
                showNode = this.showNodeArr[i];
                if ((showNode.y - showNode.height) < viewport_stop_y) { // -90 > -100
                    stop = i;
                    break;
                }
            }
        }
        if (start != this.start_index || stop != this.stop_index) {
            this.start_newer_index = start;
            this.stop_newer_index = stop;
            LogUtil.LOG("UITableView on_scrolling render_items --- ", start, stop);
            this._render_items(scrollTo);
        }
    }

    _render_items(scrollTo: ScrollTo) {
        let showNode: ShowNode = null;
        let node: cc.Node = null;
        let nextY = 0;

        if (scrollTo == ScrollTo.Bottom) {
            for (let i = this.start_index; i < this.start_newer_index; i++) {
                showNode = this.showNodeArr[i];
                this._recycle_item(showNode);
            }
        } else {
            for (let i = this.stop_index; i > this.stop_newer_index; i--) {
                showNode = this.showNodeArr[i];
                this._recycle_item(showNode);
            }
        }

        if (this.start_newer_index === 0) {
            showNode = this.showNodeArr[0];
            nextY = showNode.y;
        } else {
            showNode = this.showNodeArr[this.start_newer_index - 1];
            nextY = showNode.y - showNode.height;
        }

        for (let i = this.start_newer_index; i <= this.stop_newer_index; i++) {
            showNode = this.showNodeArr[i];
            if (showNode.node) {
                nextY -= showNode.height;
            } else {
                node = this.decorateShowNode(showNode, i, nextY);
                nextY -= node.height;
            }
        }

        this.content.height = this.estimateContentValue();

        this.start_index = this.start_newer_index;
        this.stop_index = this.stop_newer_index;

        LogUtil.LOG("UITableView alivingShowNodesCount --- ", this._alivingItemCount());
    }

    _try_recycle_item() {
        const contentY = this.content.y;
        this.contentLastY = contentY;

        let start = this.start_index;
        const viewport_start_y = -contentY;

        let showNode: ShowNode = null;
        let i = start;
        for (; i < this.stop_index; i++) {
            showNode = this.showNodeArr[i];
            if ((showNode.y - showNode.height) < viewport_start_y) {
                break;
            }
        }

        if (i != start) {
            for (let j = start; j < i; j++) {
                showNode = this.showNodeArr[j];
                if (showNode.node) {
                    this._recycle_item(showNode);
                }
            }
        }

        this.start_index = i;
    }

    layout_items() {
        let showNode: ShowNode = null;
        let node: cc.Node = null;
        let tempStopIndex = this.showNodeCount - 1;

        let nextY = 0;
        for (let i = this.start_index; i <= tempStopIndex; i++) {
            showNode = this.showNodeArr[i];
            node = this.decorateShowNode(showNode, i, nextY);

            nextY -= node.height;

            if (nextY < -this.visibleHeight) {
                this.stop_index = i;
                break;
            }
        }
        this.content.height = this.estimateContentValue();

        LogUtil.LOG("UITableView layout_items start_index --- ", this.start_index);
        LogUtil.LOG("UITableView layout_items stop_index --- ", this.stop_index);
        LogUtil.LOG("UITableView layout_items height --- ", this.visibleHeight, this.content.height);
    }

    layout_lastest_item() {
        let showNode: ShowNode = null;
        let node: cc.Node = null;
        let tempStopIndex = this.showNodeCount - 1;

        showNode = this.showNodeArr[tempStopIndex - 1];

        if (showNode.node == null) { //不需要滚动到底部 动态修改高度
            this.content.height = this.estimateContentValue();
            LogUtil.LOG("UITableView layout_lastest_item height1 --- ", this.content.height);
            return;
        }

        let nextY = showNode.y - showNode.height;
        showNode = this.showNodeArr[tempStopIndex];
        node = this.decorateShowNode(showNode, tempStopIndex, nextY);

        nextY -= node.height;

        this.stop_index = tempStopIndex;

        this.content.height = this.estimateContentValue();
        LogUtil.LOG("UITableView layout_lastest_item height2 --- ", this.content.height);

        if (nextY < -this.visibleHeight) {
            this.scrollview.scrollToBottom();
            this._try_recycle_item();
        }
    }

    decorateShowNode(showNode: ShowNode, index: number, xy: number): cc.Node {
        const node = this.nodeForIndexCB(this, index, showNode.data);
        node.y = xy;

        showNode.node = node;
        showNode.y = node.y;
        showNode.height = node.height;
        showNode.index = index;

        return node;
    }
}

export class UITableViewH extends UITableView {

    estimateContentValue(): number {
        if (!this.showNodeArr) return 0;
        let width = 0;
        this.showNodeArr.forEach((showNode, index) => {
            if (showNode.width > 0) {
                width += showNode.width;
            } else {
                width += this.nodeEstimatedHeightOrWidthCB(this, index, showNode.data);
            }
        });
        return width;
    }

    getItemByPos(pos: cc.Vec2): cc.Node {
        let retNode: cc.Node = null;
        for (let i = 0, l = this.showNodeArr.length; i < l; i++) {
            const showNode = this.showNodeArr[i];
            if (!showNode.node) {
                continue;
            }
            if (pos.x < (showNode.node.x + showNode.width) && pos.x > showNode.node.x) {
                retNode = showNode.node;
                break;
            }
        }
        return retNode;
    }

    scrollToY(v: number) {
    }

    _on_scrolling() {
        const contentY = this.content.x;
        this._calcVertical(contentY);
    }

    _calcVertical(moveY: number) {
        // 0 -50 -100
        const value = moveY - this.contentLastY;
        if (Math.abs(value) < 0.1) return;

        const scrollTo: ScrollTo = moveY - this.contentLastY < 0 ? ScrollTo.Right : ScrollTo.Left;
        this.contentLastY = moveY;

        let start = this.start_index;
        let stop = this.stop_index;
        //拿content中的node的y值 和 left值比较
        const viewport_start_y = -moveY;
        //拿content中的node的y值 和 right比较
        const viewport_stop_y = -moveY + this.visibleWidth;

        // LogUtil.LOG('UITableView on_scrolling contentY --- ', moveY);

        let showNode: ShowNode = null;

        if (scrollTo == ScrollTo.Right) { // 向下
            for (let i = stop; i < this.showNodeCount; i++) {
                showNode = this.showNodeArr[i];
                if (showNode.width < 1 || (showNode.x + showNode.width) > viewport_stop_y) {
                    stop = i;
                    break;
                }
            }
            for (let i = stop - 1; i >= start; i--) {
                showNode = this.showNodeArr[i];
                if (showNode.x < viewport_start_y) {
                    start = i;
                    break;
                }
            }
        } else { // 向上
            for (let i = start; i > -1; i--) {
                showNode = this.showNodeArr[i];
                if (showNode.x < viewport_start_y) {
                    start = i;
                    break;
                }
            }
            for (let i = start + 1; i <= stop; i++) {
                showNode = this.showNodeArr[i];
                if ((showNode.x + showNode.width) > viewport_stop_y) {
                    stop = i;
                    break;
                }
            }
        }
        if (start != this.start_index || stop != this.stop_index) {
            this.start_newer_index = start;
            this.stop_newer_index = stop;
            LogUtil.LOG("UITableView on_scrolling render_items --- ", start, stop);
            this._render_items(scrollTo);
        }
    }

    _render_items(scrollTo: ScrollTo) {
        let showNode: ShowNode = null;
        let node: cc.Node = null;
        let nextX = 0;

        if (scrollTo == ScrollTo.Right) {
            for (let i = this.start_index; i < this.start_newer_index; i++) {
                showNode = this.showNodeArr[i];
                this._recycle_item(showNode);
            }
        } else {
            for (let i = this.stop_index; i > this.stop_newer_index; i--) {
                showNode = this.showNodeArr[i];
                this._recycle_item(showNode);
            }
        }

        if (this.start_newer_index === 0) {
            showNode = this.showNodeArr[0];
            nextX = showNode.x;
        } else {
            showNode = this.showNodeArr[this.start_newer_index - 1];
            nextX = showNode.x + showNode.width;
        }
        for (let i = this.start_newer_index; i <= this.stop_newer_index; i++) {
            showNode = this.showNodeArr[i];
            if (showNode.node) {
                nextX += showNode.width;
            } else {
                node = this.decorateShowNode(showNode, i, nextX);
                nextX += node.width;
            }
        }

        this.content.width = this.estimateContentValue();

        this.start_index = this.start_newer_index;
        this.stop_index = this.stop_newer_index;

        LogUtil.LOG("UITableView alivingShowNodesCount --- ", this._alivingItemCount());
    }

    _try_recycle_item() {
        const contentY = this.content.x;
        this.contentLastY = contentY;

        let start = this.start_index;
        const viewport_start_y = contentY;

        let showNode: ShowNode = null;
        let i = start;
        for (; i < this.stop_index; i++) {
            showNode = this.showNodeArr[i];
            if ((showNode.x + showNode.width) > viewport_start_y) {
                break;
            }
        }

        if (i != start) {
            for (let j = start; j < i; j++) {
                showNode = this.showNodeArr[j];
                if (showNode.node) {
                    this._recycle_item(showNode);
                }
            }
        }

        this.start_index = i;
    }

    layout_items() {
        let showNode: ShowNode = null;
        let node: cc.Node = null;
        let tempStopIndex = this.showNodeCount - 1;

        let nextX = 0;
        for (let i = this.start_index; i <= tempStopIndex; i++) {
            showNode = this.showNodeArr[i];
            node = this.decorateShowNode(showNode, i, nextX);

            nextX += node.width;

            if (nextX > this.visibleWidth) {
                this.stop_index = i;
                break;
            }
        }
        this.content.width = this.estimateContentValue();

        LogUtil.LOG("UITableView layout_items start_index --- ", this.start_index);
        LogUtil.LOG("UITableView layout_items stop_index --- ", this.stop_index);
        LogUtil.LOG("UITableView layout_items width --- ", this.visibleWidth, this.content.width);
    }

    layout_lastest_item() {
        let showNode: ShowNode = null;
        let node: cc.Node = null;
        let tempStopIndex = this.showNodeCount - 1;

        showNode = this.showNodeArr[tempStopIndex - 1];

        if (showNode.node == null) { //不需要滚动到底部 动态修改高度
            this.content.width = this.estimateContentValue();
            return;
        }

        let nextX = showNode.x + showNode.width;
        showNode = this.showNodeArr[tempStopIndex];
        node = this.decorateShowNode(showNode, tempStopIndex, nextX);

        nextX += node.width;

        this.stop_index = tempStopIndex;

        this.content.width = this.estimateContentValue();

        if (nextX > this.visibleWidth) {
            this.scrollview.scrollToRight();
            this._try_recycle_item();
        }
    }

    decorateShowNode(showNode: ShowNode, index: number, xy: number): cc.Node {
        const node = this.nodeForIndexCB(this, index, showNode.data);
        node.x = xy;

        showNode.node = node;
        showNode.x = node.x;
        showNode.width = node.width;
        showNode.index = index;

        return node;
    }
}

export enum ScrollDirection {
    Vertical = 1,
    Horizontal = 2,
}

enum ScrollTo {
    Bottom = 1,
    Top = 2,
    Left = 3,
    Right = 4,
}

type TableViewParams = {
    scrollview: cc.ScrollView;
    content: cc.Node;
    allowScroll?: boolean;
    direction: ScrollDirection;
    nodeEstimatedHeightOrWidthCB: (tableView: UITableView, index: number, data: any) => number;
    nodeForIndexCB: (tableView: UITableView, index: number, data: any) => cc.Node;
    nodeSelectForIndexCB?: (tableView: UITableView, index: number, item: cc.Node) => void;
    nodeRemoveForIndexCB?: (tableView: UITableView, index: number, item: cc.Node) => void;
    scrollToEndCB?: () => void;
}

type ShowNode = {
    x: number;
    y: number;
    height: number;
    width: number;
    index: number;
    data: any;
    node: cc.Node;
    selected: boolean;
}

