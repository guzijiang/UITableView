declare let wx: any;
declare let qq: any;

export class ALUtil {
    
    public static DEBUG = false;
    public static LOG(message?: any, ...data) {
        if (this.DEBUG) console.log(message, data);
    }

    // ........
}
