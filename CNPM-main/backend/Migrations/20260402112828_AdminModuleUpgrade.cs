using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Petshop.API.Migrations
{
    /// <inheritdoc />
    public partial class AdminModuleUpgrade : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ApplicableCategoryId",
                table: "Vouchers",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ApplicableProductId",
                table: "Vouchers",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TargetUserType",
                table: "Vouchers",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Categories",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Categories",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Slug",
                table: "Categories",
                type: "nvarchar(120)",
                maxLength: 120,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ApplicableCategoryId",
                table: "Vouchers");

            migrationBuilder.DropColumn(
                name: "ApplicableProductId",
                table: "Vouchers");

            migrationBuilder.DropColumn(
                name: "TargetUserType",
                table: "Vouchers");

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Categories");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Categories");

            migrationBuilder.DropColumn(
                name: "Slug",
                table: "Categories");
        }
    }
}
