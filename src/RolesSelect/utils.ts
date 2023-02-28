import { PermissionItem, PermissionListType, RolesPermission } from './typing';

export const flatMapFn = (
  list: PermissionListType,
  parent: string | null = null,
) => {
  return list.reduce(
    (res: Record<string, PermissionItem & { parent: string | null }>, item) => {
      const { key, title, uiPermissions, children } = item;
      let data = { ...res };
      data[key] = {
        key,
        title,
        uiPermissions,
        parent,
        ...(children && { children }),
      };
      if (children) {
        const childrenMenus = flatMapFn(children, key);
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
    (res: RolesPermission, item) => {
      let { menu, checkedPermissions } = res;
      const { uiPermissions, key, children } = item;
      menu = [...menu, key];
      checkedPermissions = [
        ...checkedPermissions,
        ...uiPermissions.map((u) => u.key),
      ];
      if (children) {
        const { menu: subMenus, checkedPermissions: subUiCollection } =
          deepCollectMenusCheckedPermissions(children);
        menu = [...menu, ...subMenus];
        checkedPermissions = [...checkedPermissions, ...subUiCollection];
      }
      return { menu, checkedPermissions };
    },
    { menu: [], checkedPermissions: [] },
  );
};
