import { UITableViewH, ScrollDirection } from "./UITableView";
import { ALUtil } from "./util/ALUtil";
import { TestCtrl } from "./TestCtrl";

export class ALGuessLike {

    private _likeNode: cc.Node = null;

    private CELL_LIKEITEM_WIDTH = 180;
    private CELL_LIKEITEM_IDENTIFYT = 'LikeItem';

    private static _instance: ALGuessLike = null;
    public static get instance(): ALGuessLike {
        if (!ALGuessLike._instance) {
            ALGuessLike._instance = new ALGuessLike();
        }
        return ALGuessLike._instance;
    }

    private _tableView: UITableViewH = null;
    public _initNode(node: cc.Node, width?: number) {
        if (this._likeNode) return this._likeNode;

        // const container = UIUtil.parseGameUIFromJSON(likeNodeStr);
        const container = node;
        this._likeNode = container;

        //初始化width
        this._refreshWidth(width);
        
        const scrollNode = container.children[1];
        scrollNode.addComponent(cc.Mask);
        const scrollView = scrollNode.getComponent(cc.ScrollView);
        scrollView.content = scrollNode.children[0];

        const tableView: UITableViewH = new UITableViewH({
            scrollview: scrollView,
            content: scrollView.content,
            allowScroll: true,
            direction: ScrollDirection.Horizontal,
            nodeEstimatedHeightOrWidthCB: this.nodeEstimatedHeightOrWidthCB.bind(this),
            nodeForIndexCB: this.nodeForIndexCB.bind(this),
            nodeRemoveForIndexCB: this.nodeRemoveForIndexCB.bind(this)
        });

        const likeItemNode = TestCtrl.instance._getLikeItemNode();
        // const likeItemNode = UIUtil.parseGameUIFromJSON(itemNodeStr);
        tableView.registerNodeTemplateOfKey(this.CELL_LIKEITEM_IDENTIFYT, likeItemNode);
        
        this._tableView = tableView;

        this._initContent();

        return this._likeNode;
    }

    /**
     * 刷新节点宽度
     * @param width 
     */
     _refreshWidth(width?: number) {
        if (!this._likeNode) return;

        const container = this._likeNode;
        const bgNode = container.children[0];
        const scrollNode = container.children[1];
        const scrollContent = scrollNode.children[0];

        if (width && width > 40) {
            container.width = width;
            bgNode.width = width;
            scrollNode.width = width - 40;
            scrollContent.x = 0;
            scrollContent.width = width - 40;
            if (this._likeNode.parent) {
                scrollNode.getComponent(cc.Widget).updateAlignment();
            }
        }
    }

    _initContent() {
        this._tableView.set_data(likeData);
    }

    // -----------------------------------------------------------------
   
    /**
     * 预估Cell高度
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

        // const contentNode = itemNode.children[0];
    
        // const msg: Array<any> = data;

        // const img1 = contentNode.children[1].getComponent(cc.Sprite);
        // ImgLoaderUtil.getImgByUrl(data[4]).then((imgRsp: ImgRSP) => {
        //     if (!imgRsp.isSucc) {
        //         ALUtil.LOG(imgRsp.info);
        //         return;
        //     } else {
        //         const texture = imgRsp.texture;
        //         img1.spriteFrame = new cc.SpriteFrame(texture);
        //     }
        // });
        
        // const labelNode = contentNode.children[2];
        // labelNode.getComponent(cc.Label).string = msg[5];

        return itemNode;
    }

    // -----------------------------------------------------------------

    showNode() {
        if (!this._likeNode) {
            ALUtil.LOG('ALGuessLike showNode node empty');
            return;
        }
        if (!this._likeNode.parent) {
            ALUtil.LOG('ALGuessLike showNode parent empty');
            return;
        }

        this._likeNode.active = true;
    }

    hideNode() {
        if (!this._likeNode) {
            ALUtil.LOG('ALGuessLike hideNode node empty');
            return;
        }

        this._likeNode.active = false;
    }

    destroyNode() {
        if (!this._likeNode) {
            ALUtil.LOG('ALGuessLike destroyNode node empty');
            return;
        }
        if (this._likeNode.parent) {
            this._likeNode.removeFromParent();
        }

        this._tableView.destroy();
        this._tableView = null;

        this._likeNode.destroy();
        this._likeNode = null;
    }

    setPos(pos: any) {
        if (pos['x'] !== undefined) {
            const widget = this._likeNode.getComponent(cc.Widget);
            if (widget) widget.isAlignHorizontalCenter = false;
            this._likeNode.x = parseInt(pos['x']);
        }
        if (pos['y'] !== undefined) {
            const widget = this._likeNode.getComponent(cc.Widget);
            if (widget) widget.isAlignBottom = false;
            this._likeNode.y = parseInt(pos['y']);
        }
        if (pos['w'] !== undefined) {
            let w = parseInt(pos['w']);
            this._refreshWidth(w);
            this._tableView.set_data(likeData);
        }
    }
}

const likeData = 
    [[
        "wx1b7e83a618f82cc5",
        "wxdba811af3ac0f3b5",
        "pages/index/index",
        "Ads=boom_likes&AdsPos=wxf6d1b732f6f5d44c&channel=12284",
        "https://ad-static.boomegg.cn/we_app_ad/icon/icon-duiduisanguo-03.png",
        "怼怼三国",
        "",
        "",
        "",
        "1",
        ""
    ],
    [
        "wx4233cc143076bfdc",
        "wxccad312b6eb6d15f",
        "pages/index/index",
        "Ads=boom_likes&AdsPos=wxf6d1b732f6f5d44c&key=d9a066fe9e",
        "https://ad-static.boomegg.cn/we_app_ad/icon/icon-hezi-saicheduijue-01.png",
        "赛车对决",
        "",
        "",
        "",
        "",
        ""
    ],
    [
        "wx4233cc143076bfdc",
        "wx801fe783f5f0888b",
        "pages/index/index",
        "Ads=boom_likes&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/icon/icon-nine-jinyongxiakexing-03.png",
        "金庸侠客行OL",
        "",
        "",
        "",
        "",
        ""
    ],
    [
        "wx4233cc143076bfdc",
        "wx52966cd958bcd65b",
        "pages/index/index",
        "Ads=boom_likes&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/icon/icon-likes-chaojijinglingqiu-03.png",
        "超级精灵球",
        "",
        "",
        "",
        "",
        ""
    ],
    [
        "wx4233cc143076bfdc",
        "wx51c9465b2464120f",
        "pages/index/index",
        "Ads=boom_likes&AdsPos=wxf6d1b732f6f5d44c&channel=wxcccccccccccc2077",
        "https://ad-static.boomegg.cn/we_app_ad/icon/icon-hezi-moribinansuo-02.png",
        "末日避难所",
        "",
        "",
        "",
        "",
        ""
    ],
    [
        "wx4233cc143076bfdc",
        "wxb5e8feb69c66f48a",
        "pages/index/index",
        "Ads=boom_likes&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/icon/icon-juezhanhuajinaghu-07.png",
        "决战画江湖",
        "",
        "",
        "",
        "",
        ""
    ], 
    [
        "wx1b7e83a618f82cc5",
        "wxdba811af3ac0f3b5",
        "pages/index/index",
        "Ads=boom_likes&AdsPos=wxf6d1b732f6f5d44c&channel=12284",
        "https://ad-static.boomegg.cn/we_app_ad/icon/icon-duiduisanguo-03.png",
        "怼怼三国",
        "",
        "",
        "",
        "1",
        ""
    ],
    [
        "wx4233cc143076bfdc",
        "wxccad312b6eb6d15f",
        "pages/index/index",
        "Ads=boom_likes&AdsPos=wxf6d1b732f6f5d44c&key=d9a066fe9e",
        "https://ad-static.boomegg.cn/we_app_ad/icon/icon-hezi-saicheduijue-01.png",
        "赛车对决",
        "",
        "",
        "",
        "",
        ""
    ],
    [
        "wx4233cc143076bfdc",
        "wx801fe783f5f0888b",
        "pages/index/index",
        "Ads=boom_likes&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/icon/icon-nine-jinyongxiakexing-03.png",
        "金庸侠客行OL",
        "",
        "",
        "",
        "",
        ""
    ],
    [
        "wx4233cc143076bfdc",
        "wx52966cd958bcd65b",
        "pages/index/index",
        "Ads=boom_likes&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/icon/icon-likes-chaojijinglingqiu-03.png",
        "超级精灵球",
        "",
        "",
        "",
        "",
        ""
    ],
    [
        "wx4233cc143076bfdc",
        "wx51c9465b2464120f",
        "pages/index/index",
        "Ads=boom_likes&AdsPos=wxf6d1b732f6f5d44c&channel=wxcccccccccccc2077",
        "https://ad-static.boomegg.cn/we_app_ad/icon/icon-hezi-moribinansuo-02.png",
        "末日避难所",
        "",
        "",
        "",
        "",
        ""
    ],
    [
        "wx4233cc143076bfdc",
        "wxb5e8feb69c66f48a",
        "pages/index/index",
        "Ads=boom_likes&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/icon/icon-juezhanhuajinaghu-07.png",
        "决战画江湖",
        "",
        "",
        "",
        "",
        ""
    ]];