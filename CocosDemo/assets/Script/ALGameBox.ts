import { UITableViewV, ScrollDirection } from "./UITableView";
import { ALUtil } from "./util/ALUtil";
import { TestCtrl } from "./TestCtrl";

export class ALGameBox {

    private _boxNode: cc.Node = null;

    private CELL_BANNER_HEIGHT = 240;
    private CELL_BANNER_IDENTIFYT = 'Bannner';
    private CELL_TITLE_HEIGHT = 70;
    private CELL_TITLE_IDENTIFYT = 'Title';
    private CELL_ITEM_HEIGHT = 280;
    private CELL_ITEM_IDENTIFYT = 'Item';

    private static _instance: ALGameBox = null;
    public static get instance(): ALGameBox {
        if (!ALGameBox._instance) {
            ALGameBox._instance = new ALGameBox();
        }
        return ALGameBox._instance;
    }

    private _tableView: UITableViewV = null;
    private _scrollNode: cc.Node = null;
    private _scrollContent: cc.Node = null;
    private _subScrollNode: cc.Node = null;
    private _subScrollContent: cc.Node = null;

    public _initNode(node: cc.Node) {
        if (this._boxNode) return this._boxNode;

        // const container = UIUtil.parseGameUIFromJSON(boxNodeStr);
        const container = node;
        this._boxNode = container;
        
        const mainNode = container.children[0];

        const closeNode = mainNode.children[1];
        //close点击事件
        closeNode.on(cc.Node.EventType.TOUCH_END, this._onBackClick, this);

        const scrollNode = mainNode.children[2];
        const scrollView = scrollNode.getComponent(cc.ScrollView);

        const contentNode = scrollNode.children[0];
        scrollView.content = contentNode;

        const tableView: UITableViewV = new UITableViewV({
            scrollview: scrollView,
            content: contentNode,
            allowScroll: true,
            direction: ScrollDirection.Vertical,
            nodeEstimatedHeightOrWidthCB: this.nodeEstimatedHeightOrWidthCB.bind(this),
            nodeForIndexCB: this.nodeForIndexCB.bind(this),
        });

        const bannerNode = TestCtrl.instance._getBannerNode();
        const titleNode = TestCtrl.instance._getTitleNode();
        const itemNode = TestCtrl.instance._getItemNode();
        // const bannerNode = UIUtil.parseGameUIFromJSON(bannerNodeStr);
        // const titleNode = UIUtil.parseGameUIFromJSON(titleNodeStr);
        // const itemNode = UIUtil.parseGameUIFromJSON(itemNodeStr);
        tableView.registerNodeTemplateOfKey(this.CELL_BANNER_IDENTIFYT, bannerNode);
        tableView.registerNodeTemplateOfKey(this.CELL_TITLE_IDENTIFYT, titleNode);
        tableView.registerNodeTemplateOfKey(this.CELL_ITEM_IDENTIFYT, itemNode);

        this._scrollContent = contentNode;
        this._scrollNode = scrollNode;
        this._tableView = tableView;

        //scroll Touch事件
        scrollNode.on(cc.Node.EventType.TOUCH_MOVE, this._onScrollViewMove, this);
        //scroll Touch事件
        scrollNode.on(cc.Node.EventType.TOUCH_END, this._onScrollViewClick, this);

        this._initData();
      
        return this._boxNode;
    }

    _initData() {
        this._handleData();
        this._initContent();
    }

    private _boxData: Array<any> = null;
    _handleData() {
        let boxData: Array<any> = new Array();
        this._boxData = boxData;

        const hot: Array<Array<string>> = hotData;
        const hot_title: Array<any> = hot_title_data;

        const titleLength = hot_title.length;
        const hotLength = hot.length;

        const banner = sdk_banner;
        if (banner) {
            boxData.push(banner);
        }

        let begin = 0;
        for (let i = 0; i < titleLength; i++) {
            const title = hot_title[i];

            let count = title['count'];
            count = (begin + count >= hotLength) ? hotLength - begin : count;
            const tmp = hot.slice(begin, begin + count);

            if (tmp.length < 1) break;

            boxData.push(title);

            begin += count; 

            let tmpArr: Array<Array<string>> = null;
            for (let i = 0, l = tmp.length; i < l; i++) {
                if (i % 2 === 0) {
                    tmpArr = new Array();
                    boxData.push(tmpArr);
                }
                tmpArr.push(tmp[i]);
            }
        }
    }

    _initContent() {
        this._tableView.set_data(this._boxData);
    }

    // -----------------------------------------------------------------

    /**
     * 预估Cell高度
     * @param tableView 
     * @param index 
     * @param data 
     */
    private nodeEstimatedHeightOrWidthCB(tableView: UITableViewV, index: number, data: any): number {
        if (data instanceof Array) {
            if (data.length > 2) {
                return this.CELL_BANNER_HEIGHT;
            } else {
                return this.CELL_ITEM_HEIGHT;
            }
        } else {
            return this.CELL_TITLE_HEIGHT;
        }
    }

    /**
     * 正在展示cell
     * @param tableView 
     * @param index 
     * @param data 
     */
    private nodeForIndexCB(tableView: UITableViewV, index: number, data: any): cc.Node {
        if (data instanceof Array) {
            if (data.length > 2) {
                const bannerNode = tableView.obtainNodeOfKey(this.CELL_BANNER_IDENTIFYT);
                return bannerNode;
            } else {
                const itemNode = tableView.obtainNodeOfKey(this.CELL_ITEM_IDENTIFYT);
                return itemNode;
            }
        } else {
            const titleNode = tableView.obtainNodeOfKey(this.CELL_TITLE_IDENTIFYT);
            return titleNode;
        }
    }

    // -----------------------------------------------------------------

    _onBackClick() {
        ALUtil.LOG('ALGameBox _onBackClick');
        this.hideNode();
    }

    private _scrollViewMoved = false;
    /**
     * scrollView move
     * @param event 
     */
    _onScrollViewMove(event: cc.Event.EventTouch) {
        // ALUtil.LOG('ALGameBox _onScrollViewMove');
        this._scrollViewMoved = true;
    }

    /**
     * scrollView move end
     * @param event
     */
    _onScrollViewClick(event: cc.Event.EventTouch) {
        if (this._scrollViewMoved) {
            this._scrollViewMoved = false;
            return;
        }

        ALUtil.LOG('ALGameBox _onScrollViewClick --- ', event);

        //世界坐标
        let location: cc.Vec2 = event.getLocation();

        let touch: cc.Vec2 = null;
        if (ALData.isVertical) {
            touch = this._scrollNode.convertToNodeSpaceAR(location);
            touch.y -= this._scrollContent.y;
        } else {
            touch = this._subScrollNode.convertToNodeSpaceAR(location);
            touch.x -= this._subScrollContent.x;
        
            touch = cc.v2(touch.y, -touch.x);
        }
        
        const itemNode = this._tableView.getItemByPos(touch);
        if (!itemNode) return;

        ALUtil.LOG('ALGameBox _onItemClick --- ', location, touch, itemNode);

        const index = parseInt(itemNode.name);
        if (!index) return;
    }

    // -----------------------------------------------------------------

    private _cb: Function = null;
    showNode(cb?: Function) {
        if (!this._boxNode) {
            ALUtil.LOG('ALGameBox showNode node empty');
            return;
        }
        if (!this._boxNode.parent) {
            ALUtil.LOG('ALGameBox showNode parent empty');
            return;
        }

        this._cb = cb;

        this._boxNode.active = true;
    }

    hideNode() {
        if (!this._boxNode) {
            ALUtil.LOG('ALGameBox hideNode node empty');
            return;
        }

        if (this._cb) {
            this._cb();
            this._cb = null;
        }
        
        this._boxNode.active = false;
    }

    destroyNode() {
        if (!this._boxNode) {
            ALUtil.LOG('ALGameBox destroyNode node empty');
            return;
        }
        if (this._boxNode.parent) {
            this._boxNode.removeFromParent();
        }

        this._cb = null;

        this._tableView.destroy();
        this._tableView = null;

        this._boxNode.destroy();
        this._boxNode = null;
    }
}

const sdk_banner = [
    "wx4a456b4adad081b1",
    "wx4a456b4adad081b1",
    "pages/index/index",
    "Ads=boom_box_banner&tgt=test&AdsPos=wxf6d1b732f6f5d44c",
    "https://ad-static.boomegg.cn/we_app_ad/banner/bigbanner-yiquanzhixia.png",
    "一拳之下",
    "",
    "超火爆的功夫游戏 一秒变身功夫大师",
    "",
    "",
    ""
]
const hot_title_data = [
    {
        "count": 8,
        "title": "抖音爆款"
    },
    {
        "count": 8,
        "title": "女神爱玩"
    },
    {
        "count": 7,
        "title": "直播精选"
    },
    {
        "count": 7,
        "title": "手残福音"
    },
    {
        "count": 7,
        "title": "佛系养生"
    },
    {
        "count": 7,
        "title": "经典畅玩"
    }
]
const hotData = 
    [[
        "wx66539b2588a7e127",
        "wx66539b2588a7e127",
        "pages/index/index",
        "Ads=boom_box&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/tiny_banner/tb-xianjianzhizun01.jpg",
        "仙剑至尊",
        "",
        "最强熊猫萌宠，一脚踩死一只鲲！",
        "",
        "",
        ""
    ],
    [
        "wx4233cc143076bfdc",
        "wx2b164aa5d1adafd6",
        "pages/index/index",
        "Ads=boom_box&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/tiny_banner/tb-maomaoxiaodui3.jpg",
        "猫猫小队",
        "",
        "和猫猫小队一起冒险 救回公主",
        "",
        "",
        ""
    ],
    [
        "wx4233cc143076bfdc",
        "wx55965328effd38c1",
        "pages/index/index",
        "Ads=boom_box&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/tiny_banner/tb-yingxiongsha-01.jpg",
        "英雄杀",
        "",
        "一亿人都在玩的桌游杀！",
        "",
        "",
        ""
    ],
    [
        "wx4233cc143076bfdc",
        "wx87c8c7248e6f4f35",
        "pages/index/index",
        "Ads=boom_box&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/tiny_banner/tb-buyulebinfen-01.jpg",
        "海底欢乐射",
        "",
        "经典捕鱼，全新玩法！",
        "",
        "",
        ""
    ],
    [
        "wx4233cc143076bfdc",
        "wxf0f0faa8c11a59ab",
        "pages/index/index",
        "Ads=boom_box&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/tiny_banner/tb-fangkuaiqishi-01.jpg",
        "方块骑士",
        "",
        "控制方块骑士在大地图上进行乱斗对决！",
        "",
        "",
        ""
    ],
    [
        "wx4233cc143076bfdc",
        "wxe4e6492868e58104",
        "pages/index/index",
        "Ads=boom_box&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/tiny_banner/tb-waimaidaheng1.jpg",
        "外卖大亨",
        "",
        "震惊 这么大的外卖城还缺一个老板",
        "",
        "",
        ""
    ],
    [
        "wx4233cc143076bfdc",
        "wxad5b8e7b69588aa0",
        "pages/index/index",
        "Ads=boom_box&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/tiny_banner/tb-mingxinglanqiugaoshou-01.jpg",
        "明星篮球高手",
        "",
        "带球过人 上篮得分 热血暴扣",
        "",
        "",
        ""
    ],
    [
        "wx4233cc143076bfdc",
        "wx4ce5c5dc48193da4",
        "pages/index/index",
        "Ads=boom_box&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/tiny_banner/tb-shishen1.jpg",
        "食神客栈",
        "",
        "让对美食充满好奇的馋猫们一饱口福",
        "",
        "",
        ""
    ],
    [
        "wx4233cc143076bfdc",
        "wx4233cc143076bfdc",
        "pages/index/index",
        "Ads=boom_box&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/tiny_banner/tb-chuanyuedamaoxian-01.jpg",
        "好嗨游",
        "",
        "",
        "",
        "",
        ""
    ],
    [
        "wx4233cc143076bfdc",
        "wxae88542913f94fa1",
        "pages/index/index",
        "Ads=boom_box&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/tiny_banner/tb-sanguodaledou3.jpg",
        "三国大乐斗",
        "",
        "三国吃鸡大乐斗 猛将大团战",
        "",
        "",
        ""
    ],
    [
        "wx4233cc143076bfdc",
        "wx1fc598256606573d",
        "pages/index/index",
        "Ads=boom_box&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/tiny_banner/tb-tangsengkuaipao-01.jpg",
        "唐僧快跑",
        "",
        "小妖战神仙 共闯西游路",
        "",
        "",
        ""
    ],
    [
        "wx4233cc143076bfdc",
        "wxd4b4b17cf55d2f62",
        "pages/index/index",
        "Ads=boom_box&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/tiny_banner/tb-wodemenghuangongyu-01.jpg",
        "我的梦幻公寓",
        "",
        "我的梦幻公寓如同爱丽丝梦游仙境",
        "",
        "",
        ""
    ],
    [
        "wx4233cc143076bfdc",
        "wx9b5d64f9b974be57",
        "pages/index/index",
        "Ads=boom_box&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/tiny_banner/tb-meimeiaixiaoxiao-01.jpg",
        "美美爱消消",
        "",
        "叮咚！快来施展指尖魔法，消除一切不愉快",
        "",
        "",
        ""
    ],
    [
        "wx4233cc143076bfdc",
        "wx13284044918be99d",
        "pages/index/index",
        "Ads=boom_box&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/tiny_banner/tb-laiwanxiyou1.jpg",
        "来玩西游",
        "",
        "轻松休闲RPG 来玩一把西游如何",
        "",
        "",
        ""
    ],
    [
        "wx4233cc143076bfdc",
        "wxcff80354f4ef7c99",
        "pages/index/index",
        "Ads=boom_box&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/tiny_banner/tb-maidouhuanyoushijie-01.jpg",
        "小猪环游记",
        "",
        "",
        "",
        "",
        ""
    ],
    [
        "",
        "wxa38c2c6b33ba9ae1",
        "pages/index/index",
        "Ads=boom_box&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/tiny_banner/tb-fengkuangaizhaocha-01.png",
        "疯狂爱找茬",
        "https://ad-static.boomegg.cn/we_app_ad/QR/qr-fengkuangaizhaocha-01.png",
        "",
        "",
        "",
        ""
    ],
    [
        "wx4233cc143076bfdc",
        "wx90b2476e31f2bf9e",
        "pages/index/index",
        "Ads=boom_box&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/tiny_banner/tb-hulidoudizhu1.jpg",
        "狐狸斗地主",
        "",
        "欢欢乐乐斗地主 现金红包送不停",
        "",
        "",
        ""
    ],
    [
        "wx4233cc143076bfdc",
        "wx99d564ca2464fa4d",
        "pages/index/index",
        "Ads=boom_box&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/tiny_banner/tb-buyulebinfen-01.jpg",
        "捕鱼乐缤纷",
        "",
        "小鱼们嘟着嘴，想不想把它化成金币呢？",
        "",
        "",
        ""
    ],
    [
        "",
        "wxa10bc6bd400cacd3",
        "pages/index/index",
        "Ads=boom_box&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/tiny_banner/tb-chengshiyongzhe-01.jpg",
        "城市勇者",
        "https://ad-static.boomegg.cn/we_app_ad/QR/qr-chengshiyongzhe-02.jpg",
        "超爽超刺激的全新动作格斗游戏!",
        "",
        "",
        ""
    ],
    [
        "wx0f5dd3f1de960894",
        "wx0f5dd3f1de960894",
        "pages/index/index",
        "Ads=boom_box&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/tiny_banner/tb-laozizuiyouqian-01.jpg",
        "老子最有钱",
        "",
        "整栋大楼都是你的 想开什么店随意",
        "",
        "",
        ""
    ],
    [
        "wx4233cc143076bfdc",
        "wx3ac7faa4e813826e",
        "pages/index/index",
        "Ads=boom_box&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/tiny_banner/tb_adventure2.jpg",
        "成长大冒险",
        "",
        "小样儿 来打我呀",
        "",
        "",
        ""
    ],
    [
        "wx4233cc143076bfdc",
        "wx5f67f30f5495220c",
        "pages/index/index",
        "Ads=boom_box&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/tiny_banner/tb-tiantangjieti1.jpg",
        "天堂阶梯",
        "",
        "最高 最快 走上天堂之巅",
        "",
        "",
        ""
    ],
    [
        "wx4233cc143076bfdc",
        "wxf2268abc311f8025",
        "pages/index/index",
        "Ads=boom_box&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/tiny_banner/tb-juedituwei.png",
        "绝地突围",
        "",
        "刺激来袭！超大地图，丰富的战场策略",
        "",
        "",
        ""
    ],
    [
        "wx4a456b4adad081b1",
        "wx4a456b4adad081b1",
        "pages/index/index",
        "Ads=boom_box&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/tiny_banner/tb-yiquanzhixia1.jpg",
        "一拳之下",
        "",
        "超火爆的功夫游戏 一秒变身功夫大师",
        "",
        "",
        ""
    ],
    [
        "wx4233cc143076bfdc",
        "wx9e9fbbb40859606b",
        "pages/index/index",
        "Ads=boom_box&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/tiny_banner/tb-liulangjiangshi-01.png",
        "流浪僵尸",
        "",
        "星际流浪遭遇僵尸危机",
        "",
        "",
        ""
    ],
    [
        "wx4233cc143076bfdc",
        "wx989a1d751f4822a9",
        "pages/index/index",
        "Ads=boom_box&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/tiny_banner/tb-qiangshou-01.jpg",
        "王牌神枪手",
        "",
        "玩了就停不下来的魔性小游戏，不服来战！",
        "",
        "",
        ""
    ],
    [
        "wx4233cc143076bfdc",
        "wx78f9ea248b23de71",
        "pages/index/index",
        "Ads=boom_box&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/tiny_banner/tb-muou2.jpg",
        "木偶英雄",
        "",
        "操纵木偶实时2V2对战",
        "",
        "",
        ""
    ],
    [
        "wx4233cc143076bfdc",
        "wxa0956b1740d7bce2",
        "pages/index/index",
        "Ads=boom_box&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/tiny_banner/tb-wangpaigongjianshou1.jpg",
        "王牌弓箭手",
        "",
        "角度 力度 精度 大师级的操作",
        "",
        "",
        ""
    ],
    [
        "wx4233cc143076bfdc",
        "wxdb69f75d0614dfba",
        "pages/index/index",
        "Ads=boom_box&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/tiny_banner/tb-zhulaile01.jpg",
        "猪来了",
        "",
        "幸运大转盘，大奖拿不停！",
        "",
        "",
        ""
    ],
    [
        "wx4233cc143076bfdc",
        "wx889c9675c7f1f922",
        "pages/index/index",
        "Ads=boom_box&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/tiny_banner/tb-chaojipaopaolong.jpg",
        "超级泡泡龙",
        "",
        "经典搭配创新玩法 挑战最高分",
        "",
        "",
        ""
    ],
    [
        "wx4233cc143076bfdc",
        "wxcb18940551774a6f",
        "pages/index/index",
        "Ads=boom_box&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/tiny_banner/tb-shouweimengchong-0.jpg",
        "守卫萌宠",
        "",
        "果冻怪入侵，萌宠守卫家园。",
        "",
        "",
        ""
    ],
    [
        "wx4233cc143076bfdc",
        "wx80ceef7752a65dbf",
        "pages/index/index",
        "Ads=boom_box&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/tiny_banner/tb-chaiqianzuozhan5.jpg",
        "拆迁大作战",
        "",
        "老子的意大利炮呢？给我炸",
        "",
        "",
        ""
    ],
    [
        "wx4233cc143076bfdc",
        "wx7e8a91a7c128f1c5",
        "pages/index/index",
        "Ads=boom_box&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/tiny_banner/tb-woyaodangwanghong-01.jpg",
        "我要当网红",
        "",
        "从素人到网红，向上吧，小姐姐！",
        "",
        "",
        ""
    ],
    [
        "",
        "wx76560c48503ff1e0",
        "pages/index/index",
        "Ads=boom_box&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/tiny_banner/big-tianleibiepiwo-09.jpg",
        "天雷别劈我",
        "https://ad-static.boomegg.cn/we_app_ad/QR/qr-tianleibiepiwo-01.jpg",
        "合神器，求双修，渡雷劫，逍遥天地。",
        "",
        "",
        ""
    ],
    [
        "wxad6b99eff4edb027",
        "wxad6b99eff4edb027",
        "pages/index/index",
        "Ads=boom_box&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/tiny_banner/tb-nongchangxiaozhen-01.png",
        "开心农场偷菜",
        "",
        "在乡野田间和朋友一起享受幸福农场生活",
        "",
        "",
        ""
    ],
    [
        "wx4233cc143076bfdc",
        "wxbd796b16e7f93cc0",
        "pages/index/index",
        "Ads=boom_box&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/tiny_banner/tb-touhaotanke.jpg",
        "头号坦克",
        "",
        "酷炫坦克 勇闯难关 我是头号坦克",
        "",
        "",
        ""
    ],
    [
        "wx4233cc143076bfdc",
        "wxcf963c0442e31804",
        "pages/index/index",
        "Ads=boom_box&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/tiny_banner/tb-nuhuoyidao2.png",
        "怒火一刀OL",
        "",
        "经典传奇 是兄弟就一起来打江山",
        "",
        "",
        ""
    ],
    [
        "wx4233cc143076bfdc",
        "wxeb30ab498a079095",
        "pages/index/index",
        "Ads=boom_box&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/tiny_banner/tb-yingxiongxiangqianchong-04.jpg",
        "英雄向前冲",
        "",
        "英雄向前冲 老子头最铁",
        "",
        "",
        ""
    ],
    [
        "wx4233cc143076bfdc",
        "wx81f858ecf0b1deed",
        "pages/index/index",
        "Ads=boom_box&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/tiny_banner/tb-fengkuangpaoche3D-01.png",
        "疯狂跑车3D",
        "",
        "点击向右转，松开向左转，漂移到终点！",
        "",
        "",
        ""
    ],
    [
        "wx4233cc143076bfdc",
        "wxbb67c77aea9d76a8",
        "pages/index/index",
        "Ads=boom_box&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/tiny_banner/tb-yujianqiuqiu-01.png",
        "遇见球球",
        "",
        "健脑益智小游戏",
        "",
        "",
        ""
    ],
    [
        "wx4233cc143076bfdc",
        "wxd7b8494b6856d44b",
        "pages/index/index",
        "Ads=boom_box&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/tiny_banner/tb-yihuadoudizhu.jpg",
        "一花斗地主",
        "",
        "不送红包的 都不是好玩的斗地主",
        "",
        "",
        ""
    ],
    [
        "wx4233cc143076bfdc",
        "wx52966cd958bcd65b",
        "pages/index/index",
        "Ads=boom_box&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/tiny_banner/tb-jingling1.jpg",
        "超级精灵球",
        "",
        "为童年回忆干杯 快来收集属于你的宝贝",
        "",
        "",
        ""
    ],
    [
        "wx4233cc143076bfdc",
        "wx8939a217898f2f69",
        "pages/index/index",
        "Ads=boom_box&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/tiny_banner/tb-jianxianrongyao-02.jpg",
        "剑仙荣耀",
        "",
        "修仙一时爽，一直修一直爽爽爽！",
        "",
        "",
        ""
    ],
    [
        "wx4233cc143076bfdc",
        "wx0bb51b8e640dd07c",
        "pages/index/index",
        "Ads=boom_box&AdsPos=wxf6d1b732f6f5d44c",
        "https://ad-static.boomegg.cn/we_app_ad/tiny_banner/tb-xuanzhuanfeidao-01.jpg",
        "旋转飞刀大师",
        "",
        "玩了就停不下来的魔性小游戏！",
        "",
        "",
        ""
    ]]
