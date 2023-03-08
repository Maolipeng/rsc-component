/** 权限Table树 **/

import { Checkbox, Table } from 'antd';
import { uniq } from 'lodash';
import difference from 'lodash/difference';
import React, { useCallback, useMemo, useState } from 'react';
import type {
  PemissionsMapType,
  PermissionItem,
  PermissionListType,
  UiPermissionItem,
} from './typing';
import {
  deepCollectMenusCheckedPermissions,
  findDependsCascadeIds,
  flatMapFn,
  formatMatrix,
  splitStrFn,
} from './utils';

export type valueType = { menu: string[]; checkedPermissions: string[] };
interface IProps {
  data: PermissionListType; // 所有的菜单&权限原始数据
  value?: valueType;
  onChange?: (value: valueType) => void;
  className?: string;
  isCascadeMenu?: boolean;
  isSelectAll?: boolean;
}
interface RecordType extends PermissionItem {
  parent: string | null;
}
type level1Arr = string[];
type UiMenusType = {
  menus: string[];
  uiCollection: string[];
};

const judgeSelectedEmpty = (
  record: RecordType,
  uiList: level1Arr,
  treeList: level1Arr,
) => {
  console.log(1111);

  const children = record.children;
  const tempMap = record.uiPermissions.map((item) => item.key);
  const isCheckedUiPermissionsEmpty = !tempMap.some((k: string) =>
    uiList.includes(k),
  );
  if (children) {
    const childrenMenus = children.map((c) => c.key);
    const isChildrenMenusEmpty = !childrenMenus.some((t) =>
      treeList.includes(t),
    );
    return isCheckedUiPermissionsEmpty && isChildrenMenusEmpty;
  }
  return isCheckedUiPermissionsEmpty;
};
const deepCollectMenuUiPermissions = (list: PermissionListType) => {
  return list.reduce(
    (res: UiMenusType, item) => {
      let { menus, uiCollection } = res;
      const { uiPermissions, key, children } = item;
      menus = [...menus, key];
      uiCollection = [...uiCollection, ...uiPermissions.map((u) => u.key)];
      if (children) {
        const { menus: subMenus, uiCollection: subUiCollection } =
          deepCollectMenuUiPermissions(children);
        menus = [...menus, ...subMenus];
        uiCollection = [...uiCollection, ...subUiCollection];
      }
      return { menus, uiCollection };
    },
    { menus: [], uiCollection: [] },
  );
};

const findMenusRelativeList = (
  menuDetail: RecordType,
  menusMap: PemissionsMapType,
) => {
  const { key: currentKey, children } = menuDetail;
  const currentMenuDetail = menusMap[currentKey];
  const curentUiPermissions = currentMenuDetail.uiPermissions.map(
    (item) => item.key,
  );
  const ancestorMenus = [];
  let laterGenerMenus: string[] = [currentKey];
  let uiPermissions = [...curentUiPermissions];
  let parentKey = currentMenuDetail.parent;
  while (parentKey) {
    ancestorMenus.push(parentKey);
    parentKey = menusMap[parentKey].parent;
  }
  if (children) {
    const { menus, uiCollection } = deepCollectMenuUiPermissions(children);
    laterGenerMenus = [...laterGenerMenus, ...menus];
    uiPermissions = [...uiPermissions, ...uiCollection];
  }
  return {
    ancestorMenus,
    laterGenerMenus,
    uiPermissions,
  };
};

const RolesSelect: React.FC<IProps> = (props) => {
  const {
    data: sourceData,
    value,
    onChange,
    className = '',
    isSelectAll = false,
    isCascadeMenu = false,
  } = props;
  const { cascadeIdsMap, ...ALL_AUTHORITIES } = useMemo(
    () => deepCollectMenusCheckedPermissions(sourceData),
    [sourceData],
  );
  console.log('cascade', cascadeIdsMap);

  const [treeChecked, setTreeChecked] = useState<string[]>(
    value?.menu || (isSelectAll ? ALL_AUTHORITIES.menu : []),
  ); // 受控，所有被选中的表格行
  const [btnDtoChecked, setBtnDtoChecked] = useState<string[]>(
    value?.checkedPermissions ||
      (isSelectAll ? ALL_AUTHORITIES.checkedPermissions : []),
  );
  const permissionsMapFlat = useMemo(() => flatMapFn(sourceData), [sourceData]);
  console.log('permissionsMapFlat', permissionsMapFlat);

  // 被选中的权限 受控
  const dtoIsChecked = useCallback(
    (key: string): boolean => {
      return !!btnDtoChecked.find((item) => item === key);
    },
    [btnDtoChecked],
  );

  // TABLE btn权限选中和取消选中，需要记录哪些被选中
  const onBtnDtoChange = (e: any, key: string, record: RecordType) => {
    let old = [...btnDtoChecked];
    let treeCheckedTemp = [...treeChecked];
    const currentKey = record.key;
    const currentMemuDetail = permissionsMapFlat[currentKey];
    const { ancestorMenus } = findMenusRelativeList(
      currentMemuDetail,
      permissionsMapFlat,
    );
    console.log(
      'demoData',
      findDependsCascadeIds(key, cascadeIdsMap),
      cascadeIdsMap,
    );
    // 也需要拼接自己的菜单及对应的checkPermission
    const currentMenuKey = cascadeIdsMap[key]?.menuKey;
    let findRelativeCasCadeIds = findDependsCascadeIds(key, cascadeIdsMap);
    if (currentMenuKey) {
      findRelativeCasCadeIds.push(`${currentMenuKey}/${key}`);
    }
    const cascadeIdsRes = findRelativeCasCadeIds.reduce(
      (res: any, item: string) => {
        const [menuKey, checkPermission] = splitStrFn(item);
        res.cascadeIds = [...res.cascadeIds, checkPermission];
        const pathMap = permissionsMapFlat[menuKey].pathMap;
        res.menusRelative = [
          ...res.menusRelative,
          splitStrFn(pathMap as string),
        ];
        return res;
      },
      { cascadeIds: [], menusRelative: [] },
    );
    const { cascadeIds, menusRelative } = cascadeIdsRes;
    console.log('cascadeIds', cascadeIdsRes);
    const relativeMenus = formatMatrix(menusRelative);

    console.log('relativeMenus', relativeMenus);

    if (e.target.checked) {
      // 选中
      old.push(key);
      old = old.concat(cascadeIds);
      const addMenus = relativeMenus.reduce(
        (res, item) => [...res, ...item],
        [],
      );
      treeCheckedTemp = uniq([
        ...treeCheckedTemp,
        ...ancestorMenus,
        currentKey,
        ...addMenus,
      ]);
    } else {
      // 取消选中
      old.splice(old.indexOf(key), 1);
      old = difference(old, cascadeIds);

      if (isCascadeMenu && judgeSelectedEmpty(record, old, treeCheckedTemp)) {
        treeCheckedTemp.splice(treeCheckedTemp.indexOf(currentKey), 1);
        const cancelAncestorCheckedMenus = ancestorMenus.filter((item) => {
          const detail = permissionsMapFlat[item];
          const children =
            (detail.children as any).map((c: any) => c.key) || [];
          const needJudgeMenus = difference(children, [currentKey]);
          return !needJudgeMenus.some((n) => treeChecked.includes(n));
        });

        treeCheckedTemp = difference(
          treeCheckedTemp,
          cancelAncestorCheckedMenus,
        );
      }
      let i = relativeMenus.length - 1;
      while (i >= 0) {
        let item = relativeMenus[i];
        // eslint-disable-next-line @typescript-eslint/no-loop-func
        const cancelMenus = item.filter((k) =>
          judgeSelectedEmpty(permissionsMapFlat[k], old, treeCheckedTemp),
        );
        console.log('cancelMenus', cancelMenus);
        treeCheckedTemp = difference(treeCheckedTemp, cancelMenus);
        i--;
      }
    }

    setBtnDtoChecked(old);
    setTreeChecked(treeCheckedTemp);
    onChange?.({ menu: treeCheckedTemp, checkedPermissions: old });
  };

  const tableRowSelection = {
    selectedRowKeys: treeChecked,
    onChange: (newSelectedRowKeys: string[]): void => {
      setTreeChecked(newSelectedRowKeys);
    },
    onSelect: (record: RecordType, selected: boolean): void => {
      const currentKey = record.key;
      const currentMemuDetail = permissionsMapFlat[currentKey];
      const { ancestorMenus, laterGenerMenus, uiPermissions } =
        findMenusRelativeList(currentMemuDetail, permissionsMapFlat);
      if (selected) {
        const checkedUipermissons = [
          ...new Set([...btnDtoChecked, ...uiPermissions]),
        ];
        const checkedMenus = [
          ...new Set([...ancestorMenus, ...laterGenerMenus, ...treeChecked]),
        ];
        // onselect设置状态要在onChange之后
        setTimeout(() => {
          setTreeChecked(checkedMenus);
          setBtnDtoChecked(checkedUipermissons);
          onChange?.({
            menu: checkedMenus,
            checkedPermissions: checkedUipermissons,
          });
        }, 0);
      } else {
        const realCheckedUiPermissionList = difference(
          btnDtoChecked,
          uiPermissions,
        );
        const cancelAncestorCheckedMenus = ancestorMenus.filter((item) => {
          const detail = permissionsMapFlat[item];
          const children =
            (detail.children as any).map((c: any) => c.key) || [];
          const needJudgeMenus = difference(children, [currentKey]);
          return !needJudgeMenus.some((n) => treeChecked.includes(n));
        });
        const canceledMenus = [
          ...laterGenerMenus,
          ...cancelAncestorCheckedMenus,
        ];
        const realCheckedMenus = difference(treeChecked, canceledMenus);
        setTimeout(() => {
          setBtnDtoChecked(realCheckedUiPermissionList);
          setTreeChecked(realCheckedMenus);
          onChange?.({
            menu: realCheckedMenus,
            checkedPermissions: realCheckedUiPermissionList,
          });
        }, 0);
      }
    },
    onSelectAll: (selected: boolean) => {
      if (selected) {
        // 选中
        // checkedPermissions = ALL_AUTHORITIES.checkedPermissions
        const { menu, checkedPermissions } = ALL_AUTHORITIES;
        setBtnDtoChecked(checkedPermissions);
        setTreeChecked(menu);
        onChange?.(ALL_AUTHORITIES);
      } else {
        setBtnDtoChecked([]);
        setTreeChecked([]);
        onChange?.({ menu: [], checkedPermissions: [] });
      }
    },
  };

  // TABLE 字段
  const tableColumns = [
    {
      title: '菜单',
      dataIndex: 'title',
      key: 'key',
      width: '30%',
    },
    {
      title: '权限',
      dataIndex: 'uiPermissions',
      key: 'uiPermissions',
      width: '70%',
      // eslint-disable-next-line @typescript-eslint/no-shadow
      render: (
        value: UiPermissionItem[],
        record: RecordType,
      ): JSX.Element[] | null => {
        if (value?.length) {
          return value.map((item) => {
            return (
              <Checkbox
                key={item.key}
                checked={dtoIsChecked(item.key)}
                onChange={(e): void => onBtnDtoChange(e, item.key, record)}
              >
                {item.title}
              </Checkbox>
            );
          });
        }
        return null;
      },
    },
  ];

  return (
    <Table
      rowKey="key"
      rowClassName={className}
      columns={tableColumns}
      rowSelection={tableRowSelection}
      dataSource={sourceData}
      pagination={false}
      defaultExpandAllRows
    />
  );
};

export default RolesSelect;
