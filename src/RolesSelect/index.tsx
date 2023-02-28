/** 权限Table树 **/

import { Checkbox, Table } from 'antd';
import difference from 'lodash/difference';
import React, { useCallback, useMemo, useState } from 'react';
import type {
  PemissionsMapType,
  PermissionItem,
  PermissionListType,
  UiPermissionItem,
} from './typing';
import { deepCollectMenusCheckedPermissions, flatMapFn } from './utils';

interface IProps {
  data: PermissionListType; // 所有的菜单&权限原始数据
  value?: { menu: string[]; checkedPermissions: string[] };
  onChange?: (value: any) => void;
  className?: string;
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
const RscComponent: React.FC<IProps> = (props) => {
  const {
    data: sourceData,
    value = { menu: [], checkedPermissions: [] },
    onChange,
    className = '',
  } = props;
  const [treeChecked, setTreeChecked] = useState<string[]>(value.menu); // 受控，所有被选中的表格行
  const [btnDtoChecked, setBtnDtoChecked] = useState<string[]>(
    value.checkedPermissions,
  ); // 受控，所有被选中的权限数据
  const permissionsMapFlat = useMemo(() => flatMapFn(sourceData), [sourceData]);
  const ALL_AUTHORITIES = useMemo(
    () => deepCollectMenusCheckedPermissions(sourceData),
    [sourceData],
  );
  // 被选中的权限 受控
  const dtoIsChecked = useCallback(
    (key: string): boolean => {
      return !!btnDtoChecked.find((item) => item === key);
    },
    [btnDtoChecked],
  );

  // TABLE btn权限选中和取消选中，需要记录哪些被选中
  const onBtnDtoChange = (e: any, key: string, record: RecordType) => {
    const old = [...btnDtoChecked];
    let treeCheckedTemp = [...treeChecked];
    const currentKey = record.key;
    const currentMemuDetail = permissionsMapFlat[currentKey];
    const { ancestorMenus } = findMenusRelativeList(
      currentMemuDetail,
      permissionsMapFlat,
    );
    if (e.target.checked) {
      // 选中
      old.push(key);
      treeCheckedTemp = [
        ...new Set([...treeCheckedTemp, ...ancestorMenus, currentKey]),
      ];
    } else {
      // 取消选中
      old.splice(old.indexOf(key), 1);
      if (judgeSelectedEmpty(record, old, treeCheckedTemp)) {
        treeCheckedTemp.splice(treeCheckedTemp.indexOf(currentKey), 1);
        const cancelAncestorCheckedMenus = ancestorMenus.filter((item) => {
          const detail = permissionsMapFlat[item];
          const children = detail.children.map((c: any) => c.key) || [];
          const needJudgeMenus = difference(children, [currentKey]);
          return !needJudgeMenus.some((n) => treeChecked.includes(n));
        });
        treeCheckedTemp = difference(
          treeCheckedTemp,
          cancelAncestorCheckedMenus,
        );
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
      console.log('treeChecked', treeChecked);
      const { ancestorMenus, laterGenerMenus, uiPermissions } =
        findMenusRelativeList(currentMemuDetail, permissionsMapFlat);
      console.log('ancestorMenus', ancestorMenus);
      console.log('laterGenerMenus', laterGenerMenus);
      console.log('uiPermissions', uiPermissions);
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
          onChange?.({ menu: checkedMenus, checkedUipermissons });
        }, 0);
      } else {
        const realCheckedUiPermissionList = difference(
          btnDtoChecked,
          uiPermissions,
        );
        console.log('treeChecked-cancll', treeChecked);
        const cancelAncestorCheckedMenus = ancestorMenus.filter((item) => {
          const detail = permissionsMapFlat[item];
          const children = detail.children.map((c: any) => c.key) || [];
          const needJudgeMenus = difference(children, [currentKey]);
          return !needJudgeMenus.some((n) => treeChecked.includes(n));
        });
        const canceledMenus = [
          ...laterGenerMenus,
          ...cancelAncestorCheckedMenus,
        ];
        console.log('canceledMenus', canceledMenus);

        const realCheckedMenus = difference(treeChecked, canceledMenus);
        console.log('realCheckedMenus', realCheckedMenus);

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

export default RscComponent;
