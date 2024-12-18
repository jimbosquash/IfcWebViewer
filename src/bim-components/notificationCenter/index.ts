import * as OBC from "@thatopen/components";

export enum notificationType {
    installations,
    Flipping
}

export class NotificationCenter extends OBC.Component {
    static uuid = "4858833e-7ece-4294-befb-7a51fb6ba1bd" as const; // change generate new
    private _enabled = false;

    readonly onNotifcationTriggered = new OBC.Event<{ notification: notificationType, value: any }>()



    get enabled() {
        return this._enabled;
    }

    set enabled(value: boolean) {
        if (this._enabled !== this.enabled)
            this._enabled = value
    }


}