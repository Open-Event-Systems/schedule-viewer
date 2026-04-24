package schedule

import (
	"errors"

	"github.com/goccy/go-json"
)

// A slice that may be deserialized from either an array or a scalar object.
type SliceOrScalar[T any] []T

func (s *SliceOrScalar[T]) UnmarshalJSON(data []byte) error {
	var asSlice []T
	var sliceErr error

	if sliceErr = json.Unmarshal(data, &asSlice); sliceErr == nil {
		*s = asSlice
		return nil
	}

	var asScalar T
	var scalarErr error

	if scalarErr = json.Unmarshal(data, &asScalar); scalarErr == nil {
		*s = []T{asScalar}
		return nil
	}

	return errors.Join(sliceErr, scalarErr)
}
