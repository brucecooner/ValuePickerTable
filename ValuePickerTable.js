'use strict';

// TODO:
/*
ValuePickerTable : pop-over/modal for showing a table of values for user to
select from.
*table can be styled with callbacks
*see create() for configuration options

// example use
pickerFactory = new ValuePickerTable.ValuePickerTable();
picker_config = { see create() for properties };
pickerFactory.create(picker_config);

example callback for handling picked value:
picker_config['callback_function'] = function(val) { $(`#${target_element_id}`).text(val); };
*/
// must have jquery
if (typeof window.jQuery === "undefined")
{
   console.log("ERROR: ValuePickerTable: jQuery unavailable");
}
else
{
   var ValuePickerTable =
   {
      // -----------------------------------------------------------------------
      ValuePickerTable:function()
      {
         this.pickerError = function(error_message)
         {
            console.log("ERROR: ValuePicker: " + error_message);
         }

         this.default_table_picker_div_style =
         {
            "position" : "absolute",
            "left" : "0px",
            "top" : "0px",
            "padding" : "1px",
            "border-style" : "solid",
            "background-color" : "#FFFFFF",
            "z-index":1000,
				"opacity":1.0,
          };

         this.default_table_picker_td_style =
         {
            "border-style" : "solid",
            "border-width" : "1px",
         };

			this.body_cover_css = {
				"background":"rgba(255, 255, 255, 0)",
				"width":"100vw",
				"height":"100vh",
				"position":"fixed",
				"left":"0px",
				"top":"0"
			}

         // --------------------------------------------------------------------
         this.validateTableConfigObject = function(config_object)
         {
            var validation_error = "";

            var required_properties =
            [
               "columns", "values_array", "parent_element", "callback_function",
            ];

            if (!config_object)
            {
               validation_error = "config object undefined";
            }
            else
            {
               var missing_properties = "";
               required_properties.forEach( function(current_property)
               {
                  if (!config_object.hasOwnProperty(current_property))
                  {
                     if (missing_properties.length !== "")
                     {
                        missing_properties += ",";
                     }
                     missing_properties += current_property;
                  }
               })
               if (missing_properties !== "")
               {
                  validation_error = "missing properties:" + missing_properties;
               }
            }

            // values array must be an array, with length >=2
            if (config_object.hasOwnProperty("values_array"))
            {
               if (!Array.isArray(config_object["values_array"]))
               {
                  validation_error = "values_array must be an array";
               }
               else
               {
                  if (config_object["values_array"].length < 2)
                  {
                     validation_error = "values_array must be >=2 in length";
                  }
               }
            }

            // --- found error ---
            if (validation_error)
            {
               this.pickerError("table config:" + validation_error);
            }

            return validation_error === "";
         }

         // --------------------------------------------------------------------
			// TODO: re-fix centering
			// TODO: check for clipping?
			// TODO: can't scroll if off edge?
         this.centerElement = function($element, $parent_element)
         {
            // var element_width = $element.width();
            // var element_height = $element.height();
				//
            // var parent_width = $parent_element.width();
            // var parent_height = $parent_element.height();
				//
            // var new_x = -((element_width / 2) - (parent_width / 2));
            // var new_y = -((element_height / 2) - (parent_height / 2));
				//
            var parent_position = $parent_element.position();
				//
            // // clipping at top?
            // if (parent_position.top + new_y < 0)
            // {
            //    new_y = -parent_position.top;
            // }
				//
            // // clipping at left?
            // if (parent_position.left + new_x < 0)
            // {
            //    new_x = -parent_position.left;
            // }
				//
            // $element.css("left", `${new_x}px`);
            // $element.css("top", `${new_y}px`);
				// same as parent upper left for now
				$element.css("left", `${parent_position.left}px`);
            $element.css("top", `${parent_position.top}px`);

         }

         // --------------------------------------------------------------------
         /*
         table_config:
         columns: num columns (rows is determined by this + values_array size)
         values_array: values to display
         parent_element: owning element
         callback_function: called when value clicked, receives value
         div_created_callback: optional, receives non-$ element, will receives
            containing div, can be used to style/adjust
         value_created_callback: optional, receives non-$ element, will receives
            each value (td) as it is created, can be used to style/adjust
			body_cover_background: optional, becomes background attr of body cover
         */
			this.create = function(table_config)
			{
				if (!this.validateTableConfigObject(table_config))
				{
					return;
				}

				var $body_cover = $("<div></div>");

				$body_cover.css(this.body_cover_css);

				if (table_config.hasOwnProperty("body_cover_background"))
				{
					$body_cover.css("background",table_config.body_cover_background);
				}

				$body_cover.attr("id", "body_cover_id");

				// $body_cover.mouseover(function() { console.log("body cover over")});
				$body_cover.click(function() { $body_cover.remove(); } );

				$("body").append($body_cover);

				var $table_element = $("<table></table>");

				var values_array_cur_index = 0;

            while (values_array_cur_index < table_config["values_array"].length)
            {
               var $table_row = $("<tr></tr>");
               for (var column = 0; column < table_config.columns; column += 1)
               {
                  // note: stop adding elements to row when out of values
                  if (values_array_cur_index < table_config["values_array"].length)
                  {
                     var current_value = table_config["values_array"][values_array_cur_index];

                     var $td_elem = $(`<td>${current_value}</td>`);
                     $td_elem.css(this.default_table_picker_td_style);
                     if (table_config.hasOwnProperty("value_created_callback"))
                     {
                        table_config["value_created_callback"]($td_elem[0]);
                     }

                     // value element click handler
                     $td_elem.on("click", function(selected_value, $click_event)
                     {
                        // note that 'this' is the table_element (due to bind())
                        $click_event.stopPropagation();
                        this["callback_function"](selected_value);
								// this gets rid of the body cover and picker
								$body_cover.remove();

                     }.bind($table_element, current_value));

                     $table_row.append($td_elem);

                     values_array_cur_index += 1;
                  } // end if values_array_index < length
               }
               $table_element.append($table_row);
            }

            var $picker_div_element = $("<div></div>");

            $picker_div_element.append($table_element);

            $picker_div_element.css(this.default_table_picker_div_style);

				// prevent these from going to body_cover
				$picker_div_element.click(function(event) { event.stopPropagation(); });
				$picker_div_element.mouseover(function(event) { event.stopPropagation(); });

            if (table_config.hasOwnProperty("div_created_callback"))
            {
               table_config["div_created_callback"]($picker_div_element[0]);
            }

            $table_element["callback_function"] = table_config["callback_function"];
            $table_element["parent_element"] = table_config['parent_element'];
            $table_element["picker_element"] = $picker_div_element;

				$body_cover.append($picker_div_element);

            this.centerElement($picker_div_element, $(table_config.parent_element));

         } // end createTable()

      } // end constructor
   } // end var ValuePickerTable
} // end else jQuery available
