# UITableView

核心用法

//初始化TableViewH 横版TableView
const tableView: UITableViewH = new UITableViewH({
    scrollview: scrollView,
    content: scrollView.content,
    allowScroll: true,
    direction: ScrollDirection.Horizontal,
    nodeEstimatedHeightOrWidthCB: this.nodeEstimatedHeightOrWidthCB.bind(this),
    nodeForIndexCB: this.nodeForIndexCB.bind(this),
    nodeRemoveForIndexCB: this.nodeRemoveForIndexCB.bind(this)
});
//注册复用的Node
tableView.registerNodeTemplateOfKey(this.CELL_LIKEITEM_IDENTIFYT, likeItemNode);        


/**
 * Cell高度
 * @param tableView 
 * @param index 
 * @param data 
 */
private nodeEstimatedHeightOrWidthCB(tableView: UITableViewH, index: number, data: any): number {
    return this.CELL_LIKEITEM_WIDTH;
}

/**
 * cell移除事件
 * @param tableView 
 * @param index 
 * @param item 
 */
private nodeRemoveForIndexCB(tableView: UITableViewH, index: number, item: cc.Node): void {
    ALUtil.LOG('ALGuessLike nodeRemoveForIndexCB index', index);
}

/**
 * 正在展示cell
 * @param tableView 
 * @param index 
 * @param data 
 */
private nodeForIndexCB(tableView: UITableViewH, index: number, data: any): cc.Node {
    const itemNode = tableView.obtainNodeOfKey(this.CELL_LIKEITEM_IDENTIFYT);
    ...
    return itemNode;
}

注意点：scrollview，content，itemNode的锚点如果是横版的话应该是（0,0.5）竖版的话应该是（0.5， 1）
  
