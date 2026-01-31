package selections_test

import (
	"bookmarks/internal/selections"
	"slices"
	"testing"

	"github.com/goccy/go-json"
)

func TestSelections(t *testing.T) {
	t.Run("new", func(t *testing.T) {
		sels := selections.NewSelections("b", "a")
		expectedSize := 2
		expected := []string{"a", "b"}

		if sels.Size() != expectedSize {
			t.Fatalf("expected size %d, got %d", expectedSize, sels.Size())
		}

		if !slices.Equal(sels.Slice(), expected) {
			t.Fatalf("expected %s, got %s", expected, sels.Slice())
		}
	})

	t.Run("add/has", func(t *testing.T) {
		sels := selections.NewSelections("a", "b")

		if sels.Has("c") {
			t.Fatalf("was not supposed to have c: %s", sels)
		}

		added := sels.Add("c")
		if !added.Has("c") {
			t.Fatalf("did not have c: %s", added)
		}

		if sels.Has("c") {
			t.Fatalf("was not supposed to have c: %s", sels)
		}

		added2 := added.Add("a")
		if !added2.Equal(added) {
			t.Fatalf("%s != %s", added2, added)
		}
	})

	t.Run("remove", func(t *testing.T) {
		sels := selections.NewSelections("a", "b", "c")
		removed := sels.Remove("a", "c")
		expected := selections.NewSelections("b")

		if !sels.Has("a") {
			t.Fatalf("was supposed to retain a: %s", sels)
		}

		if removed.Has("a") {
			t.Fatalf("was not supposed to have a: %s", removed)
		}

		if !removed.Equal(expected) {
			t.Fatalf("%v != %v", removed, expected)
		}
	})

	t.Run("id", func(t *testing.T) {
		sel1 := selections.NewSelections("a", "b", "c")
		sel2 := selections.NewSelections("c", "b", "a")
		if sel1.Id() != sel2.Id() {
			t.Fatalf("%s != %s", sel1.Id(), sel2.Id())
		}

		sel3 := sel2.Remove("b")
		expected := selections.NewSelections("a", "c")
		if sel2.Id() == sel3.Id() {
			t.Fatalf("%s == %s", sel2.Id(), sel3.Id())
		}

		if sel3.Id() != expected.Id() {
			t.Fatalf("%s != %s", sel3.Id(), expected.Id())
		}
	})

	t.Run("empty id", func(t *testing.T) {
		var empty selections.Selections
		empty2 := selections.NewSelections()
		expected := "sel_Z0RBlgyhui3gitTlDJ_emA"
		if empty.Id() != expected {
			t.Fatalf("%s != %s", empty.Id(), expected)
		}

		if empty2.Id() !=  expected {
			t.Fatalf("%s != %s", empty2.Id(), expected)
		}
	})

	t.Run("specific id", func(t *testing.T) {
		sels := selections.NewSelections("a", "b", "c")
		expected := "sel_LXC0n0zNnM6OsRusGADH_Q"

		if sels.Id() != expected {
			t.Fatalf("%s != %s", sels.Id(), expected)
		}
	})

	t.Run("json", func(t *testing.T) {
		sels := selections.NewSelections("a", "b", "x", "y")
		asJson, err := json.Marshal(sels)
		if err != nil {
			t.Fatal(err)
		}

		var res selections.Selections
		err = json.Unmarshal(asJson, &res)
		if err != nil {
			t.Fatal(err)
		}

		if !res.Equal(sels) {
			t.Fatalf("%s != %s", res, sels)
		}
	})
}
