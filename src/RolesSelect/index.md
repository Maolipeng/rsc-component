# 组件

## RolesSelect

This is an example component.

```jsx
import { RolesSelect } from 'rsc-component';

const PERMISSION_LIST = [
  {
    key: 'dataManage',
    title: '数据中心',
    children: [
      {
        key: 'ownData',
        title: '我的数据',
        uiPermissions: [
          {
            key: 'ownDataCreate',
            title: '添加数据',
            cascadeKeys: [
              'authorizeData/authorizeDataAuth',
              'projectList/projectEdit',
              'ownData/ownDataAuth',
            ],
          },
          {
            key: 'ownDataAuth',
            title: '授权',
          },
          {
            key: 'ownDataDel',
            title: '删除',
          },
        ],
      },
      {
        key: 'authorizeData',
        title: '合作数据',
        uiPermissions: [
          {
            key: 'authorizeDataAuth',
            title: '授权',
            cascadeKeys: ['projectList/projectCreate'],
          },
        ],
      },
      {
        key: 'dataConnect',
        title: '数据连接',
        uiPermissions: [
          {
            key: 'dataConnectCreate',
            title: '新增',
          },
        ],
      },
    ],
    uiPermissions: [],
  },
  {
    key: 'projectCenter',
    title: '项目中心',
    children: [
      {
        key: 'projectList',
        title: '项目列表',
        uiPermissions: [
          {
            key: 'projectCreate',
            title: '创建项目',
          },
          {
            key: 'projectEdit',
            title: '项目设置',
            cascadeKeys: ['datasets/datasetsCreate'],
          },
          {
            key: 'projectDel',
            title: '项目删除',
          },
        ],
      },
      {
        key: 'baseInfo',
        title: '基本信息',
        uiPermissions: [
          {
            key: 'baseInfoInvite',
            title: '邀请',
          },
        ],
      },
      {
        key: 'datasets',
        title: '数据集',
        uiPermissions: [
          {
            key: 'datasetsCreate',
            title: '添加',
          },
          {
            key: 'datasetDel',
            title: '移除',
          },
          {
            key: 'datasetCp',
            title: '复制',
          },
        ],
      },
      {
        key: 'eventList',
        title: '任务列表',
        uiPermissions: [
          {
            key: 'eventCreate',
            title: '任务创建',
          },
          {
            key: 'eventStop',
            title: '任务停止',
          },
        ],
      },
      {
        key: 'workflows',
        title: '工作流',
        uiPermissions: [
          {
            key: 'createWorkflow',
            title: '创建',
          },
          {
            key: 'editWorkflow',
            title: '编辑',
          },
          {
            key: 'workflowsDel',
            title: '删除',
          },
          {
            key: 'dispatchWorkflowsTask',
            title: '发起任务',
          },
        ],
      },
      {
        key: 'templateCenter',
        title: '模板中心',
        uiPermissions: [],
      },
      {
        key: 'assetManagement',
        title: '资产管理',
        children: [
          {
            key: 'modelsManagement',
            title: '模型管理',
            uiPermissions: [
              {
                key: 'modelsManagementDel',
                title: '删除',
              },
            ],
          },
          {
            key: 'alignDatasets',
            title: '对齐数据集',
            uiPermissions: [
              {
                key: 'alignDatasetsDel',
                title: '删除',
              },
            ],
          },
          {
            key: 'ivWoeResult',
            title: 'IV&WOE结果列表',
            uiPermissions: [
              {
                key: 'ivWoeResultDel',
                title: '删除',
              },
            ],
          },
          {
            key: 'onlineService',
            title: '在线服务',
            uiPermissions: [
              {
                key: 'publishServiece',
                title: '发布',
              },
              {
                key: 'offlineServiece',
                title: '下线',
              },
              {
                key: 'testServiece',
                title: '测试',
              },
              {
                key: 'delServiece',
                title: '删除',
              },
            ],
          },
        ],
        uiPermissions: [],
      },
    ],
    uiPermissions: [],
  },
  {
    key: 'personalCenter',
    title: '个人中心',
    children: [
      {
        key: 'taskOverview',
        title: '任务概览',
        uiPermissions: [
          {
            key: 'taskOverviewStop',
            title: '停止任务',
          },
        ],
      },
      {
        key: 'behaviorLog',
        title: '行为日志',
        uiPermissions: [],
      },
      {
        key: 'approve',
        title: '审批',
        uiPermissions: [
          {
            key: 'approveExamined',
            title: '通过',
          },
          {
            key: 'approveCancel',
            title: '拒绝',
          },
        ],
      },
    ],
    uiPermissions: [],
  },
];
export default () => (
  <RolesSelect
    value={{ menu: ['dataManage', 'ownData'], checkedPermissions: [] }}
    isSelectAll
    isCascadeMenu
    data={PERMISSION_LIST}
  />
);
```

## api

| 字段名称        | 类型                         | 是否必填 | 说明                                                                      |
| --------------- | ---------------------------- | -------- | ------------------------------------------------------------------------- |
| `data`          | `PermissionListType`         | 是       | 结构化生成 ui 的数据                                                      |
| `value`         | `valueType`                  | 否       | 控制选择的内容                                                            |
| `onChange`      | `(value: valueType) => void` | 否       | 更改 value                                                                |
| `isSelectAll`   | `boolean`                    | 否       | 初始状态下是否全选, 默认值为 false 优先级低于 value,同时传入以 value 为主 |
| `className`     | `string`                     | 否       | classname                                                                 |
| `isCascadeMenu` | `boolean`                    | 否       | 按钮权限是否联动菜单取消，默认值为 false                                  |

## 类型

```
interface UiPermissionItem {
  key: string;
  title: string;
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
