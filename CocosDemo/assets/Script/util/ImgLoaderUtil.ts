export interface ImgRSP {
    isSucc: boolean;
    texture?: cc.Texture2D;
    info?: string;
}

export class ImgLoaderUtil {
    /**
     * 通过URL加载图片
     */
    public static getImgByUrl(imgUrl: string): Promise<ImgRSP> {
        return new Promise((resolve, reject) => {
            if (!imgUrl) {
                resolve({
                    isSucc: false,
                    info: `load faild: ${imgUrl}`
                });
            } else {
                cc.loader.load(imgUrl, (err, texture) => {
                    if (err) {
                        resolve({
                            isSucc: false,
                            info: `load faild: ${imgUrl}`
                        });
                    } else {
                        resolve({
                            isSucc: true,
                            texture: texture
                        });
                    }
                });
            }
        })
    }
}
