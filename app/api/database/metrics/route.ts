import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET() {
  try {
    // Try to get real database metrics
    const metrics = {
      databaseSize: await getDatabaseSize(),
      connectionCount: await getConnectionCount(),
      activeQueries: await getActiveQueries(),
      cacheHitRatio: await getCacheHitRatio(),
      cpuUsage: await getDbCpuUsage(),
      memoryUsage: await getDbMemoryUsage(),
      ioStats: await getIoStats(),
    }

    return NextResponse.json({
      success: true,
      metrics,
    })
  } catch (error) {
    console.error("Error fetching database metrics:", error)

    // Return a successful response with zeros to prevent UI errors
    return NextResponse.json({
      success: true,
      metrics: {
        databaseSize: { value: "0", unit: "GB", change: "0" },
        connectionCount: { value: 0, unit: "", change: 0 },
        activeQueries: { value: 0, unit: "", change: 0 },
        cacheHitRatio: { value: "0", unit: "%", change: "0" },
        cpuUsage: { value: "0", unit: "%", change: "0" },
        memoryUsage: { value: "0", unit: "%", change: "0" },
        ioStats: { value: "0", unit: "ms", change: "0" },
      },
    })
  }
}

// Get database size
async function getDatabaseSize() {
  try {
    const query = `
      SELECT 
        CAST(SUM(size * 8 / 1024.0) AS DECIMAL(10,2)) AS SizeMB
      FROM sys.database_files
      WHERE type_desc = 'ROWS'
    `
    const result = await executeQuery(query)
    const sizeMB = result.recordset[0].SizeMB || 0
    const sizeGB = (sizeMB / 1024).toFixed(2)

    return {
      value: sizeGB,
      unit: "GB",
      change: "0.00",
    }
  } catch (error) {
    console.error("Error getting database size:", error)
    return { value: "0", unit: "GB", change: "0" }
  }
}

// Get connection count
async function getConnectionCount() {
  try {
    const query = `
      SELECT COUNT(*) AS ConnectionCount
      FROM sys.dm_exec_connections
    `
    const result = await executeQuery(query)
    const count = result.recordset[0].ConnectionCount || 0

    return {
      value: count,
      unit: "",
      change: 0,
    }
  } catch (error) {
    console.error("Error getting connection count:", error)
    return { value: 0, unit: "", change: 0 }
  }
}

// Get active queries
async function getActiveQueries() {
  try {
    const query = `
      SELECT COUNT(*) AS ActiveQueries
      FROM sys.dm_exec_requests
      WHERE session_id > 50 -- Exclude system sessions
    `
    const result = await executeQuery(query)
    const count = result.recordset[0].ActiveQueries || 0

    return {
      value: count,
      unit: "",
      change: 0,
    }
  } catch (error) {
    console.error("Error getting active queries:", error)
    return { value: 0, unit: "", change: 0 }
  }
}

// Get cache hit ratio
async function getCacheHitRatio() {
  try {
    const query = `
      SELECT 
        (a.cntr_value * 1.0 / b.cntr_value) * 100.0 AS BufferCacheHitRatio
      FROM 
        sys.dm_os_performance_counters a
        JOIN sys.dm_os_performance_counters b ON a.object_name = b.object_name
      WHERE 
        a.counter_name = 'Buffer cache hit ratio'
        AND b.counter_name = 'Buffer cache hit ratio base'
        AND a.instance_name = '_Total'
    `
    const result = await executeQuery(query)
    const ratio = result.recordset[0]?.BufferCacheHitRatio || 0

    return {
      value: ratio.toFixed(2),
      unit: "%",
      change: "0.00",
    }
  } catch (error) {
    console.error("Error getting cache hit ratio:", error)
    return { value: "0", unit: "%", change: "0" }
  }
}

// Get database CPU usage
async function getDbCpuUsage() {
  try {
    const query = `
      SELECT 
        AVG(100 - SystemIdle) AS CPUUsage
      FROM (
        SELECT 
          record.value('(./Record/SchedulerMonitorEvent/SystemHealth/SystemIdle)[1]', 'int') AS SystemIdle
        FROM (
          SELECT TOP 10 CONVERT(xml, record) AS record
          FROM sys.dm_os_ring_buffers
          WHERE ring_buffer_type = N'RING_BUFFER_SCHEDULER_MONITOR'
          ORDER BY timestamp DESC
        ) AS RingBuffers
      ) AS SystemHealth
    `
    const result = await executeQuery(query)
    const usage = result.recordset[0]?.CPUUsage || 0

    return {
      value: usage.toFixed(2),
      unit: "%",
      change: "0.00",
    }
  } catch (error) {
    console.error("Error getting DB CPU usage:", error)
    return { value: "0", unit: "%", change: "0" }
  }
}

// Get database memory usage
async function getDbMemoryUsage() {
  try {
    const query = `
      SELECT 
        (physical_memory_in_use_kb / 1024.0) AS MemoryUsedMB,
        (total_physical_memory_kb / 1024.0) AS TotalMemoryMB
      FROM sys.dm_os_process_memory
    `
    const result = await executeQuery(query)
    const memoryUsedMB = result.recordset[0]?.MemoryUsedMB || 0
    const totalMemoryMB = result.recordset[0]?.TotalMemoryMB || 1
    const memoryUsage = (memoryUsedMB / totalMemoryMB) * 100

    return {
      value: memoryUsage.toFixed(2),
      unit: "%",
      change: "0.00",
    }
  } catch (error) {
    console.error("Error getting DB memory usage:", error)
    return { value: "0", unit: "%", change: "0" }
  }
}

// Get IO statistics
async function getIoStats() {
  try {
    const query = `
      SELECT 
        SUM(io_stall_read_ms + io_stall_write_ms) / 
        CASE WHEN SUM(num_of_reads + num_of_writes) = 0 THEN 1 
        ELSE SUM(num_of_reads + num_of_writes) END AS AvgIOLatency
      FROM sys.dm_io_virtual_file_stats(DB_ID(), NULL)
    `
    const result = await executeQuery(query)
    const latency = result.recordset[0]?.AvgIOLatency || 0

    return {
      value: latency.toFixed(2),
      unit: "ms",
      change: "0.00",
    }
  } catch (error) {
    console.error("Error getting IO stats:", error)
    return { value: "0", unit: "ms", change: "0" }
  }
}
