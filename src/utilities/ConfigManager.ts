type ConfigKey = string;
type ConfigValue = any;

export type ConfigSchema<T extends Record<ConfigKey, ConfigValue>> = {
    [K in keyof T]: {
        defaultValue: T[K];
        validate?: (value: T[K]) => boolean;
    }
};

export class ConfigManager<T extends Record<ConfigKey, ConfigValue>> extends EventTarget {
    private config: Map<keyof T, T[keyof T]>;
    private schema: ConfigSchema<T>;
    private storageKey: string;

    constructor(schema: ConfigSchema<T>, storageKey: string) {
        super(); // Initialize EventTarget
        this.config = new Map();
        this.schema = schema;
        this.storageKey = storageKey;
        this.initializeConfig();
        console.log('config man created',storageKey)
    }

    private initializeConfig(): void {
        const storedConfig = localStorage.getItem(this.storageKey);
        if (storedConfig) {
            const parsedConfig = JSON.parse(storedConfig);
            Object.keys(this.schema).forEach((key) => {
                const typedKey = key as keyof T;
                if (parsedConfig.hasOwnProperty(key)) {
                    const value = parsedConfig[key];
                    if (this.validateValue(typedKey, value)) {
                        this.config.set(typedKey, value);
                        console.log('config key found and set',typedKey,value)
                    } else {
                        this.config.set(typedKey, this.schema[typedKey].defaultValue);
                        console.log('config key not found',typedKey,value)

                    }
                } else {
                    this.config.set(typedKey, this.schema[typedKey].defaultValue);
                    console.log('config key not found to have prop',typedKey)

                }
            });
        } else {
            console.log('config not found by key',storedConfig)

            Object.keys(this.schema).forEach((key) => {
                const typedKey = key as keyof T;
                this.config.set(typedKey, this.schema[typedKey].defaultValue);
            });
        }
    }

    set<K extends keyof T>(key: K, value: T[K]): void {
        if (this.validateValue(key, value)) {
            this.config.set(key, value);
            this.saveToLocalStorage();
            const res = this.dispatchEvent(new CustomEvent('configChanged', {
                detail: { key, value, configName: this.storageKey }
            }));
            console.log('event sent for setting val',res);
        } else {
            throw new Error(`Invalid value for key: ${String(key)}`);
        }
    }

    get<K extends keyof T>(key: K): T[K] {
        console.log('config manager get',key, this.schema)
        return this.config.get(key) ?? this.schema[key].defaultValue;
    }

    private validateValue<K extends keyof T>(key: K, value: T[K]): boolean {
        const validator = this.schema[key].validate;
        return validator ? validator(value) : true;
    }

    private saveToLocalStorage(): void {
        const configObject = Object.fromEntries(this.config);
        console.log('config manager save local',this.storageKey, configObject)

        localStorage.setItem(this.storageKey, JSON.stringify(configObject));
    }
}

// const markerConfigManager = new ConfigManager<MarkerConfiguration>(markerConfigSchema, 'markerConfig');

// // Listen for configuration changes
// markerConfigManager.addEventListener('configChanged', (event: Event) => {
//     const { key, value, configName } = (event as CustomEvent).detail;
//     console.log(`Config ${configName} changed: ${String(key)} = ${value}`);
// });

// // Usage
// markerConfigManager.set('showFasteners', false);
// markerConfigManager.set('zoomLevel', 2);