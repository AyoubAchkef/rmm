using CRMEPReport.API.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace CRMEPReport.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Report> Reports => Set<Report>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Report>(entity =>
        {
            entity.ToTable("Reports");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Package);
            entity.HasIndex(e => e.Sprint);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.CreatedAt);
        });
    }
}
