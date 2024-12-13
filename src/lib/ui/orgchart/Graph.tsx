import { from } from "@/lib/mongo/query";
import { stateManager } from "@/lib/state";
import { jsx } from "@/lib/vdom";
import { Component } from "@/lib/ui/Component";
import * as d3 from "d3";

export const Graph = Component({
    loader: async () => {
        const authUser = stateManager.getState("user");

        if (!authUser?.[0]?.Accounts) {
            throw new Error("User or user accounts not found");
        }

        const accounts = Array.isArray(authUser[0].Accounts)
            ? authUser[0].Accounts
            : [authUser[0].Accounts];

        console.log("Input accounts array:", accounts);
        console.log("Is array?", Array.isArray(accounts));
        console.log("Length:", accounts.length);

        return {
            users: from("User")
                .where({
                    Accounts: {
                        $in: [...accounts]
                    }
                })
                .exec()
        }
    },
    render: (props: any) => {
        console.log("Render props:", props);
        return <div>Graph</div>
    }
});
