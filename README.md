## RscComponent

RscComponent 是基于 Ant Design 而开发的模板组件集合

- RolesSelect 是配置角色列表选择器，根据配置支持多结构嵌套，放在表单中直接作为<Form.Item name="xxx"><RolesSelect data={xxx}/></Form.Item>

## 安装

npm

```
npm i rsc-component --save
```

yarn

```
yarn add rsc-component
```

##在项目中使用
例如使用 RolesSelect

```
import { RolesSelect } from 'rsc-component'
```

## RolesSelect

[详细实例见 rsc-component 网站介绍](https://rsc-component.peakol.top/components/roles-select)

### api

| 字段名称        | 类型                         | 是否必填 | 说明                                                                      |
| --------------- | ---------------------------- | -------- | ------------------------------------------------------------------------- |
| `data`          | `PermissionListType`         | 是       | 结构化生成 ui 的数据                                                      |
| `value`         | `valueType`                  | 否       | 控制选择的内容                                                            |
| `onChange`      | `(value: valueType) => void` | 否       | 更改 value                                                                |
| `isSelectAll`   | `boolean`                    | 否       | 初始状态下是否全选, 默认值为 false 优先级低于 value,同时传入以 value 为主 |
| `className`     | `string`                     | 否       | classname                                                                 |
| `isCascadeMenu` | `boolean`                    | 否       | 按钮权限是否联动菜单取消，默认值为 false                                  |

### 类型

```
interface UiPermissionItem {
  key: string;
  title: string;
   cascadeKeys? string[]
}
interface PermissionItem {
  key: string;
  title: string;
  uiPermissions: UiPermissionItem[];
  children?: PermissionItem[];
}

type PermissionListType = PermissionItem[];
type valueType = { menu: string[]; checkedPermissions: string[] }
```

### isCascadeMenu

表示功能菜单级联 menu，有时产品认为菜单也包含着页面展示权限，勾选菜单时联动着功能权限，但功能权限全取消了页面 menu 不能同时联动取消勾选，此时配置 isCascadeMenu 为 false

如果菜单权限只表示权限功能，那页面中的查看权限应该作为功能菜单权限的一种，此时就是正常联动状态

### 级联功能

在配置菜单及功能权限时，有些功能权限依赖于其他菜单的功能权限，所以配置了 cascadeKeys 字段，内部会收集功能权限的 cascadeKeys 的集合，同时直接依赖的功能权限可能又有自己的功能权限 cascadeKeys，所以配置了一个功能字段，需要找出所有不同级别菜单的直接和间接菜单的集合（类似的多叉树的遍历），里面已经内聚
