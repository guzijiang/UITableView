import { ALGameBox } from "./ALGameBox";
import { ALGuessLike } from "./ALGuessLike";

const {ccclass, property} = cc._decorator;

@ccclass
export class TestCtrl extends cc.Component {

    @property(cc.Node)
    containerNode: cc.Node = null;

    @property(cc.Prefab)
    boxPrefab: cc.Prefab = null;
    private _boxNode: cc.Node = null;
    @property(cc.Prefab)
    cellBannerPrefab: cc.Prefab = null;
    @property(cc.Prefab)
    cellTitlePrefab: cc.Prefab = null;
    @property(cc.Prefab)
    cellItemPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    likePrefab: cc.Prefab = null;
    private _likeNode: cc.Node = null;
    @property(cc.Prefab)
    likeItemPrefab: cc.Prefab = null;

    //开启debug解析节点数据
    DEBUG = false;

    private static _instance: TestCtrl = null;
    public static get instance(): TestCtrl {
        return TestCtrl._instance;
    }

    start() {
        if (TestCtrl._instance) return;
        TestCtrl._instance = this;
    }
    /**
     * 盒子点击
     */
    onOpenBoxClick() {
        if (!this._boxNode) {
            this._boxNode = cc.instantiate(this.boxPrefab);
            this.node.addChild(this._boxNode);
        }
        if (this._boxNode.active) {
            ALGameBox.instance.hideNode();
        } else {
            ALGameBox.instance.showNode();
        }
    }

    _getBannerNode() {
        let node: cc.Node = null;
        node = cc.instantiate(this.cellBannerPrefab);
        return node;
    }

    _getTitleNode() {
        let node: cc.Node = null;
        node = cc.instantiate(this.cellTitlePrefab);
        return node;
    }

    _getItemNode() {
        let node: cc.Node = null;
        node = cc.instantiate(this.cellItemPrefab);
        return node;
    }

    /**
     * 猜你爱玩点击
     */
    onOpenGuessClick() {
        if (!this._likeNode) {
            this._likeNode = cc.instantiate(this.likePrefab);
            this.node.addChild(this._likeNode);
        }
        if (this._likeNode.active) {
            ALGuessLike.instance.hideNode();
        } else {
            ALGuessLike.instance.showNode();
        }

        ALGuessLike.instance.setPos({ y: -500, w: 500 });

        setTimeout(() => {
            ALGuessLike.instance.setPos({ y: -300, w: 800 });
        }, 3000);
    }

    _getLikeItemNode() {
        let node: cc.Node = null;
        node = cc.instantiate(this.likeItemPrefab);
        return node;
    }
}


