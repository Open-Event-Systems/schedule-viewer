package bookmarks_test

import (
	"bookmarks/internal/bookmarks"
	"slices"
	"testing"
)

func TestSelectionsId(t *testing.T) {
	sels := bookmarks.NewSelections(slices.Values([]string{"a", "b", "c"}))
	expected := "sel_pExWyBd-MtNhOYj026eWLg"

	if sels.Id() != expected {
		t.Fatalf("expected %s, got %s", expected, sels.Id())
	}
}

func TestSelectionsEqual(t *testing.T) {
	s1 := bookmarks.NewSelections(slices.Values([]string{"a", "b", "c"}))
	s2 := bookmarks.NewSelections(slices.Values([]string{"b", "a", "c", "b"}))

	if s1.Id() != s2.Id() {
		t.Fatalf("ids did not match: %s != %s", s1.Id(), s2.Id())
	}
}

func TestSelectionsSlice(t *testing.T) {
	sels := bookmarks.NewSelections(slices.Values([]string{"b", "c", "a", "b"}))
	s := sels.Slice()

	expected := []string{"a", "b", "c"}
	if !slices.Equal(s, expected) {
		t.Fatalf("expected %v, got %v", expected, s)
	}
}
