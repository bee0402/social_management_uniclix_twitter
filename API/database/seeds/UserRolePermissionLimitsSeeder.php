<?php

use Illuminate\Database\Seeder;

use App\Models\Role;
use App\Models\RoleAddon;
use App\Models\Permission;

class UserRolePermissionLimitsSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        DB::table("roles")->truncate();
        DB::table("role_addons")->truncate();
        DB::table("permissions")->truncate();
        DB::table("role_permissions")->truncate();
        DB::table("role_addon_permissions")->truncate();
        DB::table("role_limits")->truncate();

        DB::table("roles")->insert([
            [
                "name" => "twitter-booster",
                "trial_days" => 3,
                "description" => "All twitter booster features",
                "monthly_price" => 10,
                "annual_price" => 100
            ]
        ]);

        DB::table("permissions")->insert([
            [
                "name" => "manage",
                "description" => "Twitter growth"
            ],
            [
                "name" => "manage-dashboard",
                "description" => "Dashboard management"
            ],
            [
                "name" => "manage-reply",
                "description" => "Reply to users in twitter growth"
            ],
            [
                "name" => "manage-fans",
                "description" => "Fans management"
            ],
            [
                "name" => "manage-non-followers",
                "description" => "Non-followers management"
            ],
            [
                "name" => "manage-recent-unfollowers",
                "description" => "Recent unfollowers management"
            ],
            [
                "name" => "manage-recent-followers",
                "description" => "Recent followers management"
            ],
            [
                "name" => "manage-inactive-following",
                "description" => "Inactive following management"
            ],
            [
                "name" => "manage-following",
                "description" => "All following management"
            ],
            [
                "name" => "manage-account-targets",
                "description" => "Account targets management"
            ],
            [
                "name" => "manage-keyword-targets",
                "description" => "Keyword targets management"
            ],
            [
                "name" => "manage-whitelist",
                "description" => "Whitelist management"
            ],
            [
                "name" => "manage-blacklist",
                "description" => "Blacklist management"
            ],
            [
                "name" => "scheduling",
                "description" => "Scheduled posts"
            ],
            [
                "name" => "schedule-best-time",
                "description" => "Scheduled posts at best time"
            ],
            [
                "name" => "draft-posts",
                "description" => "Scheduled posts at best time"
            ],
            [
                "name" => "accounts",
                "description" => "Accounts management"
            ],
            [
                "name" => "compose",
                "description" => "Post something"
            ],
            [
                "name" => "articles",
                "description" => "Curate articles of interest"
            ],
            [
                "name" => "mentions",
                "description" => "Track social media mentions"
            ],
            [
                "name" => "streams",
                "description" => "Social listening"
            ],
            [
                "name" => "analytics",
                "description" => "Analytics"
            ],
            [
                "name" => "advanced-analytics",
                "description" => "Analytics"
            ],
        ]);

        $twitterBooster = Role::where("name", "twitter-booster")->first();

        $twitterBoosterPerm = Permission::whereIn("name",
            ["articles",
            "compose",
            "scheduling",
            "schedule-best-time",
            "analytics",
            "advanced-analytics",
            "streams",
            "draft-posts",
            "mentions",
            "manage",
            "manage-dashboard",
            "manage-reply",
            "manage-fans",
            "manage-non-followers",
            "manage-recent-unfollowers",
            "manage-recent-followers",
            "manage-inactive-following",
            "manage-following",
            "manage-account-targets",
            "manage-keyword-targets",
            "manage-whitelist",
            "manage-blacklist"])->pluck("id");

        $twitterBooster->roleLimit()->create([
            "account_limit" => 9999,
            "accounts_per_platform" => 9999,
            "team_accounts" => 9999,
            "posts_per_account" => 99999,
            "twitter_daily_follows" => 500,
            "twitter_daily_unfollows" => 500
        ]);

        $twitterBooster->permissions()->attach($twitterBoosterPerm);
    }
}
