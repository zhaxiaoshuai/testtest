## 开发环境

> 开发工具          WebStorm 2019.3.1 x64 / VScode

> 开发环境          W10

> 开发浏览器        Google Chrome

> 接口测试工具      Postman
## 项目路径说明
```
    项目基本结构（买家、后台管理、商家中心下简称三端）
    ui
        --buyer             买家端
            --pc            电脑端
            --wap           手机端
        --manager-admin     后台管理
        --manager-seller    商家中心
        --ui-components     商家中心、后台管理公用组件
        --ui-domain         三端公用api、domain设置
        --ui-utils          三端公用脚本
        --deploy.sh         生产环境部署脚本【可根据运行时的参数执行响应操作】
        --start.sh          项目生产环境启动脚本【用于当机器重启后，直接启动买家端和nginx】
```
## 命令
```

        如果修改这三个文件  * ui-domian * 、ui-components、ui-utils 需要执行  bash ./deploy.sh copy 把修改的文件同步到三端中
        bash ./deploy.sh copy       拷贝公共脚本      拷贝ui-domian、ui-components、ui-utils到各个项目根目录下

```
