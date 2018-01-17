'use strict';

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
          };

         this.default_table_picker_td_style =
         {
            "border-style" : "solid",
            "border-width" : "1px",
         };


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
         this.handleNumberPicked = function(val, $event)
         {
            this["callback_function"](val);

            this["picker_element"].remove();

            $event.stopPropagation();
         }

         // --------------------------------------------------------------------
         /*
         picker_config:
         columns: num columns (rows is determined by this + values_array size)
         values_array: values to display
         parent_element: owning element
         callback_function: called when value clicked, receives value
         div_created_callback: optional, receives non-$ element, will receives
            containing div, can be used to style/adjust
         value_created_callback: optional, receives non-$ element, will receives
            each value (td) as it is created, can be used to style/adjust
         */
         this.create = function(table_config)
         {
            if (!this.validateTableConfigObject(table_config))
            {
               return;
            }

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
                     }.bind($table_element, current_value));

                     $table_row.append($td_elem);

                     values_array_cur_index += 1;
                  } // end if values_array_index < length
               }
               $table_element.append($table_row);
            }

            var $picker_element = $("<div></div>");

            $picker_element.append($table_element);

            $picker_element.css(this.default_table_picker_div_style);

            if (table_config.hasOwnProperty("div_created_callback"))
            {
               table_config["div_created_callback"]($picker_element[0]);
            }

            $table_element["callback_function"] = table_config["callback_function"];
            $table_element["parent_element"] = table_config['parent_element'];
            $table_element["picker_element"] = $picker_element;

            $(table_config.parent_element).append($picker_element);
         } // end createTable()

      } // end constructor
   } // end var ValuePickerTable
} // end else jQuery available
