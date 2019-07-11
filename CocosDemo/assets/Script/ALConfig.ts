
export class ALConfig {

    // static envVersion = 'develop';
    static sdkVersion = '2.2.0';
    static envVersion = 'release';

    static appId: string = '';
    static version: string = '';

    static openId: string = '';
    static unionId: string = '';

    static themeurl: string = null;
    //自定义九宫格、猜你爱玩字体颜色 '#ff0000' '#ff0000'
    static draw_font_color: string = null;
    static guesslike_font_color: string = null;

    // SDK分模块接口：
    // 参数：id、module
    // module取值：box、icons、bottoms、likes、expands、shares

    static RequestUrlDev: string = 'http://192.168.0.66:9996';
    static RequestUrlTest: string = 'https://distribution-beta.boomegg.cn';
    static RequestUrlPro: string = 'https://mprogram.boomegg.cn';

    //请求域名
    static RequestUrl: string = ALConfig.RequestUrlDev;

    //SDK数据
    static sdkInitUrl: string = ALConfig.RequestUrl + '/box/sdk/init';
    // static baseUrl: string = ALConfig.RequestUrl + '/box/sdk/list';
    static baseUrl: string = ALConfig.RequestUrl + '/box/sdk/module';
    
    //上报素材统计
    static ReportMarketDomain: string = ALConfig.RequestUrlDev;
    
    //上报数据中心
    // static ReportDataDomain: string = 'https://datalog.boomegg.cn';
    static ReportDataDomain: string = 'https://distribute-stats.boomegg.cn';

    //图片URL
    static ImgDomain: string = 'https://ad-static.boomegg.cn';

    static drawerSpriteV: string = ALConfig.ImgDomain + '/sprite0708.png';
    // static drawerSpriteV: string = "https://ad-static.boomegg.cn/SDK/img/sdk_s_20181229.png";
    static drawerSpriteH: string = ALConfig.ImgDomain + '/sprite0708H.png';

    static boxSprite: string = ALConfig.ImgDomain + '/SDK/img/SDK_Gamebox.png';

    static helpSprite: string = ALConfig.ImgDomain + '/SDK/img/refresh.png';

    static MainBoxSprite: string = ALConfig.ImgDomain + '/haohaiyou.png';
    static MainBoxAppID: string = 'wx4233cc143076bfdc';

    static MarkerSprite: string = ALConfig.ImgDomain + '/marker/marker.png?t=';
    static MarkerRect = {
        'mark1': {
            x: 0,
            y: 0,
            w: 66,
            h: 40
        },
        'mark2': {
            x: 66,
            y: 0,
            w: 66,
            h: 40
        },
        'mark3': {
            x: 132,
            y: 0,
            w: 66,
            h: 40
        },
        'redpoint': {
            x: 198,
            y: 0,
            w: 43,
            h: 39
        }
    }

    static DrawerPortrait = {
        'guesslike': {
            x: 1,
            y: 1,
            w: 640,
            h: 200
        },
        'background-s': {
            x: 1,
            y: 203,
            w: 524, 
            h: 664
        },
        'refresh-s': {
            x: 1,
            y: 869,
            w: 192,
            h: 56
        },
        'close': {
            x: 195,
            y: 869,
            w: 34,
            h: 34
        },
        'mask': {
            x: 196,
            y: 906,
            w: 2,
            h: 2
        },
        'aniWhite': {
            x: 528,
            y: 204,
            w: 29,
            h: 29
        },
        'colorChange': {
            x: 528,
            y: 236,
            w: 41,
            h: 126
        }
    }

    static DrawerLandscape = {
        'background': {
            x: 1,
            y: 1,
            w: 692,
            h: 470
        },
        'close': {
            x: 695,
            y: 65,
            w: 34,
            h: 34
        },
        'refresh': {
            x: 643,
            y: 473,
            w: 72,
            h: 180
        },
        'mask': {
            x: 644,
            y: 656,
            w: 2,
            h: 2
        },
        'guesslike': {
            x: 1,
            y: 473,
            w: 640,
            h: 200
        },
        'aniWhite': {
            x: 695,
            y: 102,
            w: 29,
            h: 29
        },
        'colorChange': {
            x: 695,
            y: 134,
            w: 41,
            h: 126
        }
    }

    static BoxMap = {
        'orangePoint': {
            x: 20,
            y: 20,
            w: 5,
            h: 5
        },
        'back_button1': {
            x: 0,
            y: 78,
            w: 195,
            h: 45
        },
        'bottom_bg': {
            x: 0,
            y: 0,
            w: 329,
            h: 75
        },
        'orange_point': {
            x: 197,
            y: 78,
            w: 7,
            h: 27
        }
    }

    static HelpMap = {
        'unopenicon': {
            x: 236,
            y: 1,
            w: 73,
            h: 72
        },
        'bg1': {
            x: 1,
            y: 75,
            w: 270,
            h: 89
        },
        'openicon': {
            x: 161,
            y: 1,
            w: 73,
            h: 72
        },
        'quanzi': {
            x: 1,
            y: 1,
            w: 78,
            h: 68
        },
        'refresh': {
            x: 81,
            y: 1,
            w: 78,
            h: 68
        }
    }
}

export interface TextureRect {
    x: number,
    y: number,
    w: number,
    h: number,
}
