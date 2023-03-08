import {
  cascadeIdsMapItemType,
  PermissionItem,
  PermissionListType,
  RolesPermission,
} from './typing';

export const flatMapFn = (
  list: PermissionListType,
  parent: string | null = null,
  pathMap?: string,
) => {
  return list.reduce(
    (
      res: Record<
        string,
        PermissionItem & { parent: string | null; pathMap?: string }
      >,
      item,
    ) => {
      const { key, title, uiPermissions, children } = item;
      const transPathMap = parent === null ? key : `${pathMap}/${key}`;
      let data = { ...res };
      data[key] = {
        key,
        title,
        uiPermissions,
        parent,
        pathMap: transPathMap,
        ...(children && { children }),
      };
      if (children) {
        const childrenMenus = flatMapFn(children, key, transPathMap);
        data = { ...data, ...childrenMenus };
      }
      return data;
    },
    {},
  );
};
export const deepCollectMenusCheckedPermissions = (
  list: PermissionListType,
) => {
  return list.reduce(
    (res: RolesPermission & { cascadeIdsMap: Record<string, any> }, item) => {
      let { menu, checkedPermissions, cascadeIdsMap } = res;
      const { uiPermissions, key: menuKey, children } = item;
      menu = [...menu, menuKey];
      const uiPermissionKeys = uiPermissions.map((u) => {
        const { key, cascadeKeys } = u;
        if (cascadeKeys) {
          cascadeIdsMap[key] = { cascadeKeys, menuKey };
        }
        return key;
      });
      checkedPermissions = [...checkedPermissions, ...uiPermissionKeys];
      if (children) {
        const {
          menu: subMenus,
          checkedPermissions: subUiCollection,
          cascadeIdsMap: subCascadeIdsMap,
        } = deepCollectMenusCheckedPermissions(children);
        menu = [...menu, ...subMenus];
        checkedPermissions = [...checkedPermissions, ...subUiCollection];
        cascadeIdsMap = { ...cascadeIdsMap, ...subCascadeIdsMap };
      }
      return { menu, checkedPermissions, cascadeIdsMap };
    },
    { menu: [], checkedPermissions: [], cascadeIdsMap: {} },
  );
};

export const splitStrFn = (str: string, by: string = '/'): string[] =>
  str.split(by);

export const findDependsCascadeIds = (
  key: string,
  cascadeIdsMap: Record<string, cascadeIdsMapItemType>,
): string[] => {
  const cascadeKeysList: string[] | null = cascadeIdsMap[key]?.cascadeKeys;
  if (cascadeKeysList) {
    const dependKeys = cascadeKeysList.reduce((res: string[], item: string) => {
      const splitArr = splitStrFn(item);
      return [
        ...res,
        item,
        ...findDependsCascadeIds(splitArr[splitArr.length - 1], cascadeIdsMap),
      ];
    }, []);
    return dependKeys;
  }
  return [];
};

export type Migtrix = string[][];
export const formatMatrix = (matrix: Migtrix): Migtrix => {
  let result: Migtrix = [];
  matrix.forEach((item) => {
    item.forEach((m, index) => {
      if (!result[index]) {
        result[index] = [];
      }
      if (!result[index].includes(m)) {
        result[index].push(m);
      }
    });
  });
  return result;
};
