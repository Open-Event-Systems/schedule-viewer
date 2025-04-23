# Map Design

The map is an SVG document representing the event space. Any tool can be used to
create the SVG, but [Inkscape](https://inkscape.org/) is recommended as it is
free, it supports applying CSS classes to elements, and its files can be used
directly without an export step.

# Map Components

## Levels

Levels are the floors of the event space. Example: Lower, Lobby, 2F, 3F, and so
on.

When designing the map, place all elements of each floor into their own group or
Inkscape layer. Add the following CSS classes to each level group: `Map-level
Map-level-id-{id}`, where `{id}` is the ID of the level.

**Important:** The level groups must not have any transformations added to them.
The isometric view will override these transformations, and the levels will be
positioned incorrectly.

## Layers

Layers (not to be confused with Inkscape layers, or similar concepts in other
programs) provide a way to group similar map features together and allow them to
be toggled on or off by the user. Example: all text elements might be part of
the "Text" layer, and minute details like plants or seating might be in a
"Details" layer.

Add the following CSS classes to an element or group to assign it to a layer:
`Map-layer Map-layer-id-{id}`, where `{id}` is the layer ID. Any number of
elements may be assigned to a layer.

## Areas

An area is an element, usually a rect or path, that indicates a specific
location on the map. Example: you might draw a rect on the map to represent a
ballroom. It might have a different fill color to distinguish it from other
parts of the event space.

Add the following CSS classes to specify an element as an area: `Map-area
Map-area-id-{id}`, where `{id}` is the ID of a location.

When selected by the user, an area will gain the class `Map-highlight`. A CSS
rule with a selector like `.Map-area.Map-highlight` can change its fill color or
animate it to indicate the selection.

## Click Elements

A click element is an element which receives click/touch events and displays a
pointer cursor on hover. Clicking the element causes the user to select the
corresponding location.

To mark an element as a click element, add the CSS classes `Map-click
Map-click-id-{id}`, where `{id}` is the ID of a location.

An area element can also be a click element, but any other elements on top of it
(e.g. text) will reduce the clickable area. You can either specify these
elements as click elements also, or create a shape with 0 opacity that is on top
of all of them.

## Event Titles

The titles of ongoing events may be displayed on the map.

Two types of elements may be used: a text element or a rect element.

Text elements will have their contents replaced with the event title. This is
the simplest method, but text elements do not support automatic text wrapping.

Rect elements will be entirely replaced with a foreignObject element containing
HTML, which does support text wrapping. To use this, create a rect that will
represent the box that will contain the text. The foreignObject will contain a
HTML div element with the class `Map-foreignObjectText` which can be used to
style the text.

Add the following CSS classes to the element: `Map-event-name
Map-event-name-id-{id}`, where `{id}` is the ID of a location.

## Vendor Names

The names of vendors may be displayed on the map in a similar way to event
titles. See the above section for details, and use the classes `Map-vendor-name
Map-vendor-name-id-{id}`, where `{id}` is the ID of a location.

## Vendor Icons

Vendors may also have icons that can be displayed on the map. Add the following
CSS classes to an element: `Map-vendor-icon Map-vendor-icon-id-{id}`, where
`{id}` is the ID of a location.

Image elements will have their href attribute replaced with the vendor's icon.
When designing the map, set the href attribute to point to a placeholder image,
or `data:,` for no image.

The classes may be added to any element, not just an image element. Example: a
frame or border around the image.

By default, elements with these classes will not be visible unless the vendor
has an icon specified.

## Flags

Flags are options that can be turned on or off to apply CSS rules to the map.

Flags can be enabled:

- Manually in the map configuration
- Automatically during a timespan
- Via a parameter in the URL (`#flag={id}`)

If a flag is enabled, the CSS class `Map-flag-id-{id}` will be added to the
map's root svg element, where `{id}` is the ID of the flag.

## Utility Classes

A few utility classes are available to customize the map behavior:

- `Map-isometric` - automatically set on the map's root svg element when
  isometric view is enabled.
- `Map-isometric-transition-finished` - automatically set on the map's root svg
  element when isometric view is enabled and the transition has finished.
- `Map-isometric-transition-hidden` - add this to an element to cause it to be
  hidden during the transition into isometric view.

## CSS Variables

Some map functionality can be customized via CSS variables applied to each
level.

### Isometric View Angles

Isometric view is created by rotating each level 45 degrees around the Z axis,
and then 54.7 degrees into the screen around the X axis. These angles are
overridable with the following variables:

- `--map-isometric-rotation: 45deg;` - sets the rotation about the Z axis.
- `--map-isometric-x-scale: 0.578;` - sets the "rotation" about the X axis.
  **Note**: This is implemented via `scaleX` rather than `rotateX`, because any
  "3D" transformation causes elements to flicker when combined with other CSS
  animations in Chrome. The default value shown here is `cos(-54.7deg)`.

### Isometric Offsets

The following CSS variables should be set to half the width and height of your
map SVG:

- `--map-isometric-center-x-offset`
- `--map-isometric-center-y-offset`

This is required for the isometric transform to be applied around the center of
the document (by default, SVG transforms are relative to 0,0).

**Note:** `-50%` would take care of this automatically, but does not work
properly in WebKit browsers.

Each level can also have the following variables set to adjust its position in
the isometric view:

- `--map-isometric-x-offset`
- `--map-isometric-y-offset`

These offsets are applied _after_ the isometric transformation, and they should
be used to provide the "height" between levels.

### Transition Duration

- `--map-isometric-transition-duration: 0.5s;` - sets the duration of the
  isometric transition.
