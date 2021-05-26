package memory

import (
	"syscall"

	"github.com/VictoriaMetrics/VictoriaMetrics/lib/cgroup"
	"github.com/VictoriaMetrics/VictoriaMetrics/lib/logger"
	"golang.org/x/sys/unix"
)

const PHYS_PAGES = 0x1f4

func sysTotalMemory() int {
	cnt := syscall.Getpagesize()
	n, err := unix.Sysconf(PHYS_PAGES)
	if err != nil {
		logger.Panicf("FATAL: error in syscall.Sysinfo: %s", err)
	}

	totalMem := int64(cnt) * n

	mem := cgroup.GetMemoryLimit()
	if mem <= 0 || int64(int(mem)) != mem || mem > totalMem {
		// Try reading hierachical memory limit.
		// See https://github.com/VictoriaMetrics/VictoriaMetrics/issues/699
		mem = cgroup.GetHierarchicalMemoryLimit()
		if mem <= 0 || int64(int(mem)) != mem || mem > totalMem {
			return int(totalMem)
		}
	}
	return int(mem)
}
