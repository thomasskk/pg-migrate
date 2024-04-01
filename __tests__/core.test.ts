import { expect, describe, test, vi, afterEach } from "vitest";
import { migrate, plan, verify } from "../src/core.js";
import { Sql } from "postgres";
import * as utils from "../src/utils.js";

describe("core", async () => {
  const mockSqlInstance = vi.fn();

  afterEach(() => {
    vi.restoreAllMocks();
    mockSqlInstance.mockClear();
  });

  describe("plan", async () => {
    test("should not return applied migrations", async () => {
      vi.spyOn(utils, "getSortedMigrations").mockResolvedValue([
        { id: "1", content: "Migration 1 content" },
        { id: "2", content: "Migration 2 content" },
      ]);

      vi.spyOn(utils, "applied").mockResolvedValue([
        {
          id: "1",
          checksum: "checksum1",
          executionTimeInMillis: 1000,
          appliedAt: new Date(),
        },
      ]);

      const migrations = await plan({
        sql: mockSqlInstance as unknown as Sql,
        dir: "",
      });

      expect(migrations).toEqual([{ id: "2", content: "Migration 2 content" }]);
    });
  });

  describe("verify", async () => {
    test("should succeed", async () => {
      vi.spyOn(utils, "applied").mockResolvedValue([
        {
          id: "2",
          checksum: utils.getMD5("Migration 2 content"),
          executionTimeInMillis: 2000,
          appliedAt: new Date(),
        },
        {
          id: "3",
          checksum: utils.getMD5("Migration 3 content"),
          executionTimeInMillis: 2000,
          appliedAt: new Date(),
        },
        {
          id: "1",
          checksum: utils.getMD5("Migration 1 content"),
          executionTimeInMillis: 1000,
          appliedAt: new Date(),
        },
      ]);

      vi.spyOn(utils, "getSortedMigrations").mockResolvedValue([
        { id: "1", content: "Migration 1 content" },
        { id: "2", content: "Migration 2 content" },
        { id: "3", content: "Migration 3 content" },
      ]);

      verify({ sql: mockSqlInstance as unknown as Sql, dir: "" });
    });

    test("should throw for checksum mismatch", async () => {
      vi.spyOn(utils, "applied").mockResolvedValue([
        {
          id: "1",
          checksum: utils.getMD5("Migration 1 content"),
          executionTimeInMillis: 1000,
          appliedAt: new Date(),
        },
      ]);

      vi.spyOn(utils, "getSortedMigrations").mockResolvedValue([
        { id: "1", content: "modified content" },
      ]);

      await expect(() =>
        verify({ sql: mockSqlInstance as unknown as Sql, dir: "" }),
      ).rejects.toThrowError(/^Migration 1 checksum mismatch./);
    });

    test("should throw for missing migration", async () => {
      vi.spyOn(utils, "applied").mockResolvedValue([
        {
          id: "1",
          checksum: utils.getMD5("Migration 1 content"),
          executionTimeInMillis: 1000,
          appliedAt: new Date(),
        },
      ]);

      vi.spyOn(utils, "getSortedMigrations").mockResolvedValue([]);

      await expect(() =>
        verify({ sql: mockSqlInstance as unknown as Sql, dir: "" }),
      ).rejects.toThrowError(/Migration 1 not found/);
    });
  });

  describe("migrate", async () => {
    test("should succeed with 2 migrations", async () => {
      vi.spyOn(utils, "ensureMigrationsTable").mockResolvedValue();
      vi.spyOn(utils, "acquireLock").mockResolvedValue();
      vi.spyOn(utils, "releaseLock").mockResolvedValue();
      vi.spyOn(utils, "applied").mockResolvedValue([]);
      const applyMigrationSpy = vi
        .spyOn(utils, "applyMigration")
        .mockImplementation(() => {
          return Promise.resolve();
        });

      vi.spyOn(utils, "getSortedMigrations").mockResolvedValue([
        { id: "1", content: "Migration 1 content" },
        { id: "3", content: "Migration 3 content" },
      ]);

      await migrate({ sql: mockSqlInstance as unknown as Sql, dir: "" });

      expect(applyMigrationSpy).toHaveBeenCalledTimes(2);
      expect(applyMigrationSpy).toHaveBeenCalledWith({
        sql: mockSqlInstance,
        migration: { content: "Migration 1 content", id: "1" },
      });
      expect(applyMigrationSpy).toHaveBeenCalledWith({
        sql: mockSqlInstance,
        migration: { content: "Migration 3 content", id: "3" },
      });
    });
  });
});
