package main

import (
	"errors"
	"flag"
	"fmt"
	"oembed/internal/server"
	"strings"
)

type SchedulePath struct {
	ScheduleID string
	Path       string
}

type SchedulePathSlice []*SchedulePath

func ParseEventPath(val string) *SchedulePath {
	scheduleId, path, ok := strings.Cut(val, ":")
	if !ok {
		return nil
	}

	return &SchedulePath{ScheduleID: scheduleId, Path: path}
}

func (es *SchedulePathSlice) String() string {
	return fmt.Sprintf("%v", *es)
}

func (es *SchedulePathSlice) Set(val string) error {
	parsed := ParseEventPath(val)
	if parsed == nil {
		return errors.New("invalid event path mapping")
	}

	*es = append(*es, parsed)
	return nil
}

func main() {
	var port int
	var eventPathSlice SchedulePathSlice
	flag.IntVar(&port, "port", 8001, "the port to listen on")
	flag.Var(&eventPathSlice, "path", "map a schedule ID to a path where the files are located")

	flag.Parse()

	pathMap := make(map[string]string)

	for _, ep := range eventPathSlice {
		pathMap[ep.ScheduleID] = ep.Path
	}

	server.RunServer(port, pathMap)
}
