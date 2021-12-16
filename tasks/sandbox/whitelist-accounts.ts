import { task } from "hardhat/config";
import { getMarketContracts } from "../../config/addresses";
import { addPermissions } from "../../helpers/actions";
import { MarketIds } from "../../config/types";

task(
  "whitelist-accounts:arc",
  "Whitelist user account at Aave Arc inside the Sandbox"
)
  .addParam("accounts")
  .addOptionalParam("roles")
  .setAction(
    async ({ accounts, roles }: { roles: string; accounts: string }, hre) => {
      const { permissionsManager } = await getMarketContracts(MarketIds.Arc);

      const userAccounts: string[] = accounts.split(",");
      const userRoles: string[] = roles ? roles.split(",") : ["0", "1", "2"];

      await addPermissions(permissionsManager, userRoles, userAccounts);

      console.log("- Whitelisted users to PermissionManager");
      console.log(userAccounts.join(","));
    }
  );
